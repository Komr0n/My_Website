const express = require('express');
const router = express.Router();
const { login, logout, showLogin } = require('../controllers/authController');

router.get('/admin/login', showLogin);
router.post('/admin/login', login);
router.post('/admin/logout', logout);

module.exports = router;


