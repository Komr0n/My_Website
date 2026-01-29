const { About, Project, Certificate, Post } = require('../models');
const { Op } = require('sequelize');

exports.getAbout = async (req, res) => {
    try {
        let about = await About.findOne();
        if (!about) {
            about = await About.create({
                title: 'Комрон Жураев',
                content: 'System Administrator & Security Enthusiast',
                skills: 'RouterOS, Windows Server, Linux, Zabbix, Python, C#',
                avatar: '/images/default-avatar.png'
            });
        }
        
        if (req.path === '/') {
            res.render('index', { about, title: 'Digital SysAdmin' });
        } else {
            res.render('about', { about, title: 'About' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading about page');
    }
};

exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({ order: [['createdAt', 'DESC']] });
        res.render('projects', { projects, title: 'Projects' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading projects');
    }
};

exports.getCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.findAll({ order: [['issueDate', 'DESC']] });
        res.render('certificates', { certificates, title: 'Certificates' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading certificates');
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.findAll({ 
            where: { 
                status: 'published',
                publishedAt: { [Op.lte]: new Date() }
            },
            order: [['publishedAt', 'DESC']]
        });
        res.render('posts', { posts, title: 'Blog' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading posts');
    }
};

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findOne({ 
            where: { 
                slug: req.params.slug,
                status: 'published',
                publishedAt: { [Op.lte]: new Date() }
            }
        });
        
        if (!post) {
            return res.status(404).send('Post not found');
        }

        let sections = [];
        if (post.sections) {
            try {
                const parsed = JSON.parse(post.sections);
                if (Array.isArray(parsed)) {
                    sections = parsed;
                }
            } catch (error) {
                sections = [];
            }
        }
        if (!sections.length) {
            sections = [{ title: '', content: post.content }];
        }

        res.render('post', { post, sections, title: post.title });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post');
    }
};


