const { About, Project, Certificate, Post } = require('../models');

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
            where: { published: true },
            order: [['createdAt', 'DESC']]
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
                published: true 
            }
        });
        
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        res.render('post', { post, title: post.title });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post');
    }
};


