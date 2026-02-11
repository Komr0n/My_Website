const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, logout, showLogin } = require('../controllers/authController');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts, try again in 15 minutes.'
});

router.get('/admin/login', showLogin);
router.post('/admin/login', loginLimiter, login);
router.post('/admin/logout', logout);

module.exports = router;


