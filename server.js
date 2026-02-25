const express = require('express');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const session = require('express-session');
const methodOverride = require('method-override');
const compression = require('compression');
const helmet = require('helmet');
const { csrfSync } = require('csrf-sync');
const connectPgSimple = require('connect-pg-simple');
require('dotenv').config();

const { sequelize } = require('./config/database');
const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const { getSiteSettings, DEFAULT_SITE_SETTINGS } = require('./services/siteSettings');
const { adminAuditMiddleware } = require('./services/auditLogger');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const forceSecureCookie = process.env.FORCE_SECURE_COOKIE === 'true';
const useSecureCookie = isProduction || forceSecureCookie;
const sessionSecret = process.env.SESSION_SECRET;
const usePgSessionStore = isProduction || process.env.SESSION_STORE === 'postgres';

if (isProduction && (!sessionSecret || sessionSecret.length < 32)) {
    throw new Error('SESSION_SECRET must be set and at least 32 chars in production');
}
if (!sessionSecret) {
    console.warn('SESSION_SECRET is not set. Using development fallback secret.');
}

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
if (useSecureCookie) {
    app.set('trust proxy', 1);
}

app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
    next();
});

app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            scriptSrc: [
                "'self'",
                (req, res) => `'nonce-${res.locals.cspNonce}'`,
                'https://cdn.quilljs.com'
            ],
            styleSrc: [
                "'self'",
                (req, res) => `'nonce-${res.locals.cspNonce}'`,
                "'unsafe-inline'",
                'https://fonts.googleapis.com',
                'https://cdn.quilljs.com'
            ],
            imgSrc: ["'self'", 'data:', 'https:'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
            connectSrc: ["'self'"]
        }
    },
    referrerPolicy: { policy: 'no-referrer' }
}));

app.use(compression({
    threshold: 1024
}));

app.use(express.static(path.join(__dirname, 'public'), {
    etag: true,
    lastModified: true,
    maxAge: isProduction ? '7d' : 0,
    setHeaders: (res, filePath) => {
        if (/\.(?:js|css|svg|woff2?|ttf|eot)$/i.test(filePath)) {
            res.setHeader('Cache-Control', isProduction
                ? 'public, max-age=604800, immutable'
                : 'public, max-age=0');
            return;
        }

        if (/\.(?:png|jpe?g|gif|webp|avif|ico)$/i.test(filePath)) {
            res.setHeader('Cache-Control', isProduction
                ? 'public, max-age=2592000'
                : 'public, max-age=0');
        }
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

let sessionStore;
if (usePgSessionStore) {
    const PgStore = connectPgSimple(session);
    const hasUrl = !!process.env.DATABASE_URL;
    sessionStore = new PgStore({
        tableName: process.env.SESSION_TABLE || 'session',
        createTableIfMissing: true,
        conString: hasUrl ? process.env.DATABASE_URL : undefined,
        conObject: hasUrl ? undefined : {
            database: process.env.DB_NAME || 'my_website',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASS || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT || 5432),
            ssl: isProduction && process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false
        },
        pruneSessionInterval: 15 * 60,
        errorLog: (error) => console.error('Session store error:', error)
    });
}

// Session configuration
app.use(session({
    name: process.env.SESSION_COOKIE_NAME || 'sid',
    secret: sessionSecret || 'dev-only-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: useSecureCookie,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const { csrfSynchronisedProtection, generateToken } = csrfSync({
    getTokenFromRequest: (req) => {
        if (req.body && req.body._csrf) {
            return req.body._csrf;
        }
        if (req.query && req.query._csrf) {
            return req.query._csrf;
        }
        return req.headers['csrf-token'] || req.headers['x-csrf-token'];
    }
});

app.use(csrfSynchronisedProtection);

app.use(async (req, res, next) => {
    try {
        res.locals.siteSettings = await getSiteSettings();
    } catch (error) {
        console.error('Error loading site settings:', error);
        res.locals.siteSettings = DEFAULT_SITE_SETTINGS;
    }
    next();
});

app.use((req, res, next) => {
    res.locals.authUser = req.session && req.session.userId ? {
        id: req.session.userId,
        username: req.session.username || 'unknown',
        role: req.session.role || 'editor'
    } : null;
    res.locals.csrfToken = generateToken(req);
    next();
});

// Routes
app.use('/', siteRoutes);
app.use('/contact', contactRoutes);

// Admin routes with authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/auth/admin/login');
};

app.use('/admin', requireAuth, adminAuditMiddleware, adminRoutes);
app.use('/auth', authRoutes);

// Initialize database and start server
const shouldSync = process.env.DB_SYNC === 'true' || (process.env.NODE_ENV !== 'production' && process.env.DB_SYNC !== 'false');
const dbInit = shouldSync ? sequelize.sync({ force: false }) : sequelize.authenticate();

dbInit.then(() => {
    console.log(shouldSync ? 'Database synchronized' : 'Database connection established');

    app.listen(PORT, '0.0.0.0', () => {
        const nets = os.networkInterfaces();
        const lanIps = [];
        Object.keys(nets).forEach((name) => {
            (nets[name] || []).forEach((net) => {
                if (net && net.family === 'IPv4' && !net.internal) {
                    lanIps.push(net.address);
                }
            });
        });
        console.log(`Digital SysAdmin Portfolio is running on http://localhost:${PORT}`);
        console.log(`Admin panel: http://localhost:${PORT}/auth/admin/login`);
        lanIps.forEach((ip) => {
            console.log(`LAN: http://${ip}:${PORT}`);
        });
        console.log('Default users are not auto-created for security.');
    });
}).catch(err => {
    console.error('Database connection error:', err);
});

app.use((err, req, res, next) => {
    const message = (err && err.message) ? err.message.toLowerCase() : '';
    if (err && (err.code === 'EBADCSRFTOKEN' || message.includes('csrf'))) {
        return res.status(403).send('Invalid or missing CSRF token');
    }
    return next(err);
});

module.exports = app;
