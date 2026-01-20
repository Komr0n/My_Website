const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.showLogin = (req, res) => {
    if (req.session.userId) {
        return res.redirect('/admin');
    }
    res.render('admin/login', { title: 'Admin Login', error: null });
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            return res.render('admin/login', { 
                title: 'Admin Login', 
                error: 'Invalid username or password' 
            });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.render('admin/login', { 
                title: 'Admin Login', 
                error: 'Invalid username or password' 
            });
        }
        
        req.session.userId = user.id;
        req.session.username = user.username;
        
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Login error');
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
};


