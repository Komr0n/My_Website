function requireAdmin(req, res, next) {
    if (req.session && req.session.role === 'admin') {
        return next();
    }
    return res.status(403).send('Forbidden: admin role required');
}

module.exports = {
    requireAdmin
};
