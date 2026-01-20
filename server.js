const express = require('express');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
require('dotenv').config();

const { sequelize } = require('./config/database');
const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'digital-sysadmin-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.use('/', siteRoutes);
app.use('/contact', contactRoutes);

// Admin routes with authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/auth/admin/login');
    }
};

app.use('/admin', requireAuth, adminRoutes);
app.use('/auth', authRoutes);

// Initialize database and start server
sequelize.sync({ force: false }).then(() => {
    console.log('Database synchronized');
    
    // Create default admin user if not exists
    const { User } = require('./models');
    User.findOne({ where: { username: 'admin' } })
        .then(user => {
            if (!user) {
                const bcrypt = require('bcrypt');
                bcrypt.hash('admin123', 10).then(hash => {
                    User.create({
                        username: 'admin',
                        password: hash,
                        role: 'admin'
                    }).then(() => {
                        console.log('Default admin user created (username: admin, password: admin123)');
                    });
                });
            }
        });
    
    app.listen(PORT, () => {
        console.log(`\n🚀 Digital SysAdmin Portfolio is running on http://localhost:${PORT}`);
        console.log(`🔐 Admin panel: http://localhost:${PORT}/auth/admin/login`);
        console.log(`   Default credentials: admin / admin123\n`);
    });
}).catch(err => {
    console.error('Database connection error:', err);
});

module.exports = app;

