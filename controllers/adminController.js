const { About, Project, Certificate, Post, ContactMessage, Task, Media } = require('../models');
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

// Multer configuration for post cover images
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

exports.uploadPostImage = uploadPostImage.single('coverImage');

// Multer configuration for media library and editor images
const mediaImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/uploads/media');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, 'media-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadMediaImage = multer({ 
    storage: mediaImageStorage,
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

exports.uploadEditorImage = uploadMediaImage.single('file');
exports.uploadMedia = uploadMediaImage.single('media');

// Upload image handler for editor
exports.uploadEditorImageHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = '/uploads/media/' + req.file.filename;
        await Media.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: imageUrl
        });
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
        const tasksCount = await Task.count();
        
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            projectsCount,
            certificatesCount,
            postsCount,
            messagesCount,
            tasksCount
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

function parseSections(raw) {
    if (!raw) {
        return [];
    }
    try {
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) {
            return [];
        }
        return data
            .map(section => ({
                title: section.title ? section.title.toString().trim() : '',
                content: section.content ? section.content.toString() : ''
            }))
            .filter(section => section.title || section.content);
    } catch (error) {
        return [];
    }
}

function buildDefaultSections(post) {
    if (post && post.sections) {
        try {
            const parsed = JSON.parse(post.sections);
            if (Array.isArray(parsed) && parsed.length) {
                return parsed;
            }
        } catch (error) {
            return [{ title: '', content: post.content || '' }];
        }
    }
    if (post && post.content) {
        return [{ title: '', content: post.content }];
    }
    return [{ title: '', content: '' }];
}

function buildExcerpt(excerpt, html) {
    if (excerpt && excerpt.trim()) {
        return excerpt.trim();
    }
    const text = html ? html.replace(/<[^>]*>/g, '') : '';
    return text.substring(0, 160);
}

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

exports.addPost = async (req, res) => {
    try {
        const media = await Media.findAll({ order: [['createdAt', 'DESC']] });
        const sections = buildDefaultSections();
        res.render('admin/editPost', { post: null, sections, media, title: 'Add Post' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post editor');
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, subtitle, excerpt, status, publishedAt } = req.body;
        const sections = parseSections(req.body.sections);
        const mainContent = sections[0] ? sections[0].content : '';

        if (!title || !title.trim()) {
            return res.status(400).send('Title is required');
        }
        if (!mainContent || !mainContent.trim()) {
            return res.status(400).send('At least one section with content is required');
        }

        let coverImagePath = null;
        if (req.file) {
            coverImagePath = '/uploads/posts/' + req.file.filename;
        }
        if (!coverImagePath) {
            return res.status(400).send('Cover image is required');
        }

        const finalStatus = status === 'published' ? 'published' : 'draft';
        const finalPublishedAt = finalStatus === 'published'
            ? (publishedAt ? new Date(publishedAt) : new Date())
            : null;

        await Post.create({ 
            title: title.trim(),
            subtitle: subtitle ? subtitle.trim() : '',
            content: mainContent,
            sections: JSON.stringify(sections),
            excerpt: buildExcerpt(excerpt, mainContent),
            status: finalStatus,
            publishedAt: finalPublishedAt,
            coverImage: coverImagePath,
            featuredImage: coverImagePath
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
        const media = await Media.findAll({ order: [['createdAt', 'DESC']] });
        const sections = buildDefaultSections(post);
        res.render('admin/editPost', { post, sections, media, title: 'Edit Post' });
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

        const { title, subtitle, excerpt, status, publishedAt } = req.body;
        const sections = parseSections(req.body.sections);
        const mainContent = sections[0] ? sections[0].content : '';

        if (!title || !title.trim()) {
            return res.status(400).send('Title is required');
        }
        if (!mainContent || !mainContent.trim()) {
            return res.status(400).send('At least one section with content is required');
        }

        const finalStatus = status === 'published' ? 'published' : 'draft';
        let finalPublishedAt = null;
        if (finalStatus === 'published') {
            finalPublishedAt = publishedAt ? new Date(publishedAt) : (post.publishedAt || new Date());
        }

        const updateData = {
            title: title.trim(),
            subtitle: subtitle ? subtitle.trim() : '',
            content: mainContent,
            sections: JSON.stringify(sections),
            excerpt: buildExcerpt(excerpt, mainContent),
            status: finalStatus,
            publishedAt: finalPublishedAt
        };

        if (req.file) {
            const oldImagePath = post.coverImage || post.featuredImage;
            if (oldImagePath && oldImagePath.startsWith('/uploads/posts/')) {
                const oldFilePath = path.join(__dirname, '../public', oldImagePath);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            updateData.coverImage = '/uploads/posts/' + req.file.filename;
            updateData.featuredImage = updateData.coverImage;
        }

        if (!updateData.coverImage && !post.coverImage && !post.featuredImage) {
            return res.status(400).send('Cover image is required');
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
        
        // Delete cover image if exists
        const imagePath = post.coverImage || post.featuredImage;
        if (imagePath && imagePath.startsWith('/uploads/posts/')) {
            const filePath = path.join(__dirname, '../public', imagePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        await post.destroy();
        res.redirect('/admin/posts');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting post');
    }
};

// Media library
exports.manageMedia = async (req, res) => {
    try {
        const media = await Media.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/media', { media, title: 'Media Library' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading media library');
    }
};

exports.addMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }
        const imageUrl = '/uploads/media/' + req.file.filename;
        await Media.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: imageUrl
        });
        res.redirect('/admin/media');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading media');
    }
};

exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) {
            return res.status(404).send('Media not found');
        }
        if (media.url && media.url.startsWith('/uploads/media/')) {
            const filePath = path.join(__dirname, '../public', media.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        await media.destroy();
        res.redirect('/admin/media');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting media');
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

// Tasks
exports.manageTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            order: [
                ['completed', 'ASC'],
                ['createdAt', 'DESC']
            ]
        });
        res.render('admin/manageTasks', { tasks, title: 'My Tasks' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading tasks');
    }
};

exports.addTask = (req, res) => {
    res.render('admin/editTask', { task: null, title: 'Add Task' });
};

exports.createTask = async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        await Task.create({
            title: title && title.trim() ? title.trim() : 'Untitled Task',
            description: description ? description.trim() : '',
            completed: completed === 'on'
        });
        res.redirect('/admin/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating task');
    }
};

exports.editTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.render('admin/editTask', { task, title: 'Edit Task' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading task');
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        const { title, description, completed } = req.body;
        await task.update({
            title: title && title.trim() ? title.trim() : task.title,
            description: description ? description.trim() : '',
            completed: completed === 'on'
        });
        res.redirect('/admin/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating task');
    }
};

exports.toggleTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        await task.update({ completed: !task.completed });
        res.redirect('/admin/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error toggling task');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        await task.destroy();
        res.redirect('/admin/tasks');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting task');
    }
};

