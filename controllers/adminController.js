const { About, Project, Certificate, Post, ContactMessage } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and PDF files are allowed'));
        }
    }
});

exports.uploadCertificate = upload.single('image');

// Multer configuration for avatar uploads
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/avatars');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadAvatar = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

exports.uploadAvatar = uploadAvatar.single('avatar');

// Multer configuration for post featured images
const postImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/posts');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'post-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadPostImage = multer({ 
    storage: postImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

exports.uploadPostImage = uploadPostImage.single('featuredImage');

// Multer configuration for TinyMCE image uploads
const editorImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/editor');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'editor-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadEditorImage = multer({ 
    storage: editorImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

exports.uploadEditorImage = uploadEditorImage.single('file');

// Upload image handler for TinyMCE editor
exports.uploadEditorImageHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const imageUrl = '/uploads/editor/' + req.file.filename;
        res.json({ location: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error uploading image' });
    }
};

// Dashboard
exports.getDashboard = async (req, res) => {
    try {
        const projectsCount = await Project.count();
        const certificatesCount = await Certificate.count();
        const postsCount = await Post.count();
        const messagesCount = await ContactMessage.count({ where: { read: false } });
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            projectsCount,
            certificatesCount,
            postsCount,
            messagesCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading dashboard');
    }
};

// About management
exports.manageAbout = async (req, res) => {
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
        res.render('admin/editAbout', { about, title: 'Edit About' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading about');
    }
};

exports.updateAbout = async (req, res) => {
    try {
        const { title, content, skills } = req.body;
        let about = await About.findOne();
        
        let avatarPath = null;
        if (req.file) {
            // Delete old avatar if exists
            if (about && about.avatar && about.avatar.startsWith('/uploads/avatars/')) {
                const oldAvatarPath = path.join(__dirname, '../public', about.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }
            avatarPath = '/uploads/avatars/' + req.file.filename;
        }
        
        const updateData = { title, content, skills };
        if (avatarPath) {
            updateData.avatar = avatarPath;
        }
        
        if (about) {
            await about.update(updateData);
        } else {
            about = await About.create({
                ...updateData,
                avatar: avatarPath || '/images/default-avatar.svg'
            });
        }
        
        res.redirect('/admin/about');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating about');
    }
};

// Project management
exports.manageProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/manageProjects', { projects, title: 'Manage Projects' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading projects');
    }
};

exports.addProject = (req, res) => {
    res.render('admin/editProject', { project: null, title: 'Add Project' });
};

exports.createProject = async (req, res) => {
    try {
        const { title, description, technologies, githubLink, liveLink } = req.body;
        await Project.create({ title, description, technologies, githubLink, liveLink });
        res.redirect('/admin/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating project');
    }
};

exports.editProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        res.render('admin/editProject', { project, title: 'Edit Project' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading project');
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        
        const { title, description, technologies, githubLink, liveLink } = req.body;
        await project.update({ title, description, technologies, githubLink, liveLink });
        
        res.redirect('/admin/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating project');
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).send('Project not found');
        }
        
        await project.destroy();
        res.redirect('/admin/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting project');
    }
};

// Certificate management
exports.manageCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.findAll({ order: [['issueDate', 'DESC']] });
        res.render('admin/manageCertificates', { certificates, title: 'Manage Certificates' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading certificates');
    }
};

exports.addCertificate = async (req, res) => {
    try {
        const { title, description, issueDate } = req.body;
        const image = '/uploads/' + req.file.filename;
        
        await Certificate.create({ title, description, issueDate, image });
        res.redirect('/admin/certificates');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding certificate');
    }
};

exports.deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByPk(req.params.id);
        if (!certificate) {
            return res.status(404).send('Certificate not found');
        }
        
        // Delete image file
        const imagePath = path.join(__dirname, '../public', certificate.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        await certificate.destroy();
        res.redirect('/admin/certificates');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting certificate');
    }
};

// Post management
exports.managePosts = async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/managePosts', { posts, title: 'Manage Posts' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading posts');
    }
};

exports.addPost = (req, res) => {
    res.render('admin/editPost', { post: null, title: 'Add Post' });
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, excerpt, published } = req.body;
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        
        let featuredImagePath = null;
        if (req.file) {
            featuredImagePath = '/uploads/posts/' + req.file.filename;
        }
        
        await Post.create({ 
            title, 
            content, 
            excerpt, 
            published: published === 'on', 
            slug,
            featuredImage: featuredImagePath
        });
        res.redirect('/admin/posts');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating post');
    }
};

exports.editPost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.render('admin/editPost', { post, title: 'Edit Post' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post');
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        const { title, content, excerpt, published } = req.body;
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        
        const updateData = { title, content, excerpt, published: published === 'on', slug };
        
        if (req.file) {
            // Delete old featured image if exists
            if (post.featuredImage && post.featuredImage.startsWith('/uploads/posts/')) {
                const oldImagePath = path.join(__dirname, '../public', post.featuredImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.featuredImage = '/uploads/posts/' + req.file.filename;
        }
        
        await post.update(updateData);
        
        res.redirect('/admin/posts');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating post');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        
        // Delete featured image if exists
        if (post.featuredImage && post.featuredImage.startsWith('/uploads/posts/')) {
            const imagePath = path.join(__dirname, '../public', post.featuredImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await post.destroy();
        res.redirect('/admin/posts');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting post');
    }
};

// Messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/messages', { messages, title: 'Messages' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading messages');
    }
};

