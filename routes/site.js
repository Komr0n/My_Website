const express = require('express');
const router = express.Router();
const { getAbout, getProjects, getCertificates, getPosts, getPost } = require('../controllers/siteController');

router.use((req, res, next) => {
    const queryLang = typeof req.query.lang === 'string' ? req.query.lang.toLowerCase() : '';
    if (queryLang === 'ru' || queryLang === 'en') {
        req.session.lang = queryLang;
    }

    const currentLang = req.session.lang === 'en' ? 'en' : 'ru';
    res.locals.currentLang = currentLang;
    res.locals.currentPath = req.path;
    next();
});

router.get('/', getAbout);
router.get('/about', getAbout);
router.get('/projects', getProjects);
router.get('/certificates', getCertificates);
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact', query: req.query, seoPageKey: 'contact' });
});
router.get('/blog', getPosts);
router.get('/blog/:slug', getPost);

module.exports = router;

