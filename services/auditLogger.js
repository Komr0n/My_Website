const { AuditLog } = require('../models');

function sanitizeBody(body) {
    if (!body || typeof body !== 'object') {
        return '';
    }
    const safe = { ...body };
    if (safe.password) {
        safe.password = '[REDACTED]';
    }
    if (safe.sections && typeof safe.sections === 'string' && safe.sections.length > 400) {
        safe.sections = `${safe.sections.slice(0, 400)}...[truncated]`;
    }
    const serialized = JSON.stringify(safe);
    return serialized.length > 1200 ? `${serialized.slice(0, 1200)}...[truncated]` : serialized;
}

async function writeAuditLog(entry) {
    try {
        await AuditLog.create(entry);
    } catch (error) {
        console.warn('Audit log write failed:', error.message);
    }
}

function adminAuditMiddleware(req, res, next) {
    const method = (req.method || '').toUpperCase();
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        return next();
    }

    const startedAt = Date.now();
    res.on('finish', () => {
        writeAuditLog({
            userId: req.session && req.session.userId ? req.session.userId : null,
            username: (req.session && req.session.username) || 'unknown',
            role: (req.session && req.session.role) || 'unknown',
            method,
            path: req.originalUrl || req.path || '',
            statusCode: res.statusCode,
            ipAddress: req.ip || '',
            userAgent: req.get('user-agent') || '',
            details: JSON.stringify({
                durationMs: Date.now() - startedAt,
                body: sanitizeBody(req.body)
            })
        });
    });

    next();
}

module.exports = {
    adminAuditMiddleware
};
