const express = require('express');
const router = express.Router();
const { getAbout, getProjects, getCertificates, getPosts, getPost } = require('../controllers/siteController');

router.get('/', getAbout);
router.get('/about', getAbout);
router.get('/projects', getProjects);
router.get('/certificates', getCertificates);
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact', query: req.query });
});
router.get('/blog', getPosts);
router.get('/blog/:slug', getPost);

module.exports = router;

