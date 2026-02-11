const { About, Project, Certificate, Post, ContactMessage, Task, Media, AuditLog, User, SiteSetting } = require('../models');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const os = require('os');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { pipeline } = require('stream/promises');
const { sequelize } = require('../config/database');
const sanitizeHtml = require('sanitize-html');
const { optimizeUploadedImage } = require('../services/imageOptimizer');
const {
    getSiteSettings,
    setSiteSetting,
    buildHomePayload,
    buildFooterPayload,
    buildSeoPayload,
    buildNavigationPayload,
    buildContactPayload,
    SEO_PAGES
} = require('../services/siteSettings');

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
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif|pdf/;
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
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
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
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
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
        const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
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

const uploadBackupFile = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const allowedMime = [
            'application/json',
            'text/json',
            'application/octet-stream'
        ];
        if (ext === '.json' || allowedMime.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Only JSON backup files are allowed'));
    }
});

exports.uploadBackup = uploadBackupFile.single('backupFile');

const backupZipStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(os.tmpdir(), 'digital-sysadmin-backups');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, `backup-${Date.now()}.zip`);
    }
});

const uploadBackupZipFile = multer({
    storage: backupZipStorage,
    limits: { fileSize: 250 * 1024 * 1024 }, // 250MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const allowedMime = [
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream'
        ];
        if (ext === '.zip' || allowedMime.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Only ZIP backup files are allowed'));
    }
});

exports.uploadBackupZip = uploadBackupZipFile.single('backupZip');

// Upload image handler for editor
exports.uploadEditorImageHandler = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        await optimizeUploadedImage(req.file, { maxWidth: 2200, quality: 82 });

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
            tasksCount,
            isAdmin: req.session && req.session.role === 'admin'
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
                title: 'Komron Juraev',
                titleEn: 'Komron Juraev',
                content: 'System Administrator & Security Enthusiast',
                contentEn: 'System Administrator & Security Enthusiast',
                skills: 'RouterOS, Windows Server, Linux, Zabbix, Python, C#',
                skillsEn: 'RouterOS, Windows Server, Linux, Zabbix, Python, C#',
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
        const title = (req.body.title || '').trim();
        const titleEn = (req.body.titleEn || '').trim();
        const content = (req.body.content || '').trim();
        const contentEn = (req.body.contentEn || '').trim();
        const skills = (req.body.skills || '').trim();
        const skillsEn = (req.body.skillsEn || '').trim();

        if (!title || !titleEn || !content || !contentEn || !skills || !skillsEn) {
            return res.status(400).send('Both RU and EN fields are required for About');
        }

        let about = await About.findOne();

        let avatarPath = null;
        if (req.file) {
            await optimizeUploadedImage(req.file, { maxWidth: 900, quality: 82 });
            // Delete old avatar if exists
            if (about && about.avatar && about.avatar.startsWith('/uploads/avatars/')) {
                const oldAvatarPath = path.join(__dirname, '../public', about.avatar);
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }
            avatarPath = '/uploads/avatars/' + req.file.filename;
        }

        const updateData = { title, titleEn, content, contentEn, skills, skillsEn };
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
        const title = (req.body.title || '').trim();
        const titleEn = (req.body.titleEn || '').trim();
        const description = (req.body.description || '').trim();
        const descriptionEn = (req.body.descriptionEn || '').trim();
        const technologies = (req.body.technologies || '').trim();
        const technologiesEn = (req.body.technologiesEn || '').trim();
        const image = (req.body.image || '').trim() || '/images/default-project.svg';
        const githubLink = (req.body.githubLink || '').trim();
        const liveLink = (req.body.liveLink || '').trim();

        if (!title || !titleEn || !description || !descriptionEn || !technologies || !technologiesEn) {
            return res.status(400).send('Both RU and EN fields are required for project');
        }

        await Project.create({
            title,
            titleEn,
            description,
            descriptionEn,
            technologies,
            technologiesEn,
            image,
            githubLink,
            liveLink
        });
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

        const title = (req.body.title || '').trim();
        const titleEn = (req.body.titleEn || '').trim();
        const description = (req.body.description || '').trim();
        const descriptionEn = (req.body.descriptionEn || '').trim();
        const technologies = (req.body.technologies || '').trim();
        const technologiesEn = (req.body.technologiesEn || '').trim();
        const image = (req.body.image || '').trim() || project.image || '/images/default-project.svg';
        const githubLink = (req.body.githubLink || '').trim();
        const liveLink = (req.body.liveLink || '').trim();

        if (!title || !titleEn || !description || !descriptionEn || !technologies || !technologiesEn) {
            return res.status(400).send('Both RU and EN fields are required for project');
        }

        await project.update({
            title,
            titleEn,
            description,
            descriptionEn,
            technologies,
            technologiesEn,
            image,
            githubLink,
            liveLink
        });

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
        const title = (req.body.title || '').trim();
        const titleEn = (req.body.titleEn || '').trim();
        const description = (req.body.description || '').trim();
        const descriptionEn = (req.body.descriptionEn || '').trim();
        const issueDate = req.body.issueDate || null;

        if (!title || !titleEn || !descriptionEn) {
            return res.status(400).send('Certificate title/titleEn/descriptionEn are required');
        }
        if (!req.file) {
            return res.status(400).send('Certificate file is required');
        }

        const image = '/uploads/' + req.file.filename;

        await Certificate.create({ title, titleEn, description, descriptionEn, issueDate, image });
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

exports.manageHomeSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const home = settings.home;
        res.render('admin/editHome', {
            title: 'Edit Home Page',
            home,
            terminalCommandsText: (home.terminalCommands || []).join('\n')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading home settings');
    }
};

exports.updateHomeSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const nextHome = buildHomePayload(req.body, settings.home);
        await setSiteSetting('home', nextHome);
        res.redirect('/admin/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating home settings');
    }
};

exports.manageFooterSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const footer = settings.footer;
        res.render('admin/editFooter', {
            title: 'Edit Footer',
            footer,
            quickLinksText: (footer.quickLinks || [])
                .map(link => `${link.label}|${link.url}`)
                .join('\n'),
            socialLinksText: (footer.socialLinks || [])
                .map(link => `${link.label}|${link.url}`)
                .join('\n')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading footer settings');
    }
};

exports.updateFooterSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const nextFooter = buildFooterPayload(req.body, settings.footer);
        await setSiteSetting('footer', nextFooter);
        res.redirect('/admin/footer');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating footer settings');
    }
};

exports.manageSeoSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        res.render('admin/editSeo', {
            title: 'SEO Settings',
            seo: settings.seo,
            pages: SEO_PAGES
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading SEO settings');
    }
};

exports.updateSeoSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const nextSeo = buildSeoPayload(req.body, settings.seo);
        await setSiteSetting('seo', nextSeo);
        res.redirect('/admin/seo');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating SEO settings');
    }
};

exports.manageNavigationSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const navigation = settings.navigation;
        res.render('admin/editNavigation', {
            title: 'Edit Navigation',
            navigation,
            linksText: (navigation.links || [])
                .map(link => `${link.label}|${link.url}`)
                .join('\n')
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading navigation settings');
    }
};

exports.updateNavigationSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const nextNavigation = buildNavigationPayload(req.body, settings.navigation);
        await setSiteSetting('navigation', nextNavigation);
        res.redirect('/admin/navigation');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating navigation settings');
    }
};

exports.manageContactSettings = async (req, res) => {
    try {
        const settings = await getSiteSettings();
        const contact = settings.contact;
        res.render('admin/editContact', {
            title: 'Edit Contact Page',
            contact
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading contact settings');
    }
};

exports.updateContactSettings = async (req, res) => {
    try {
        const requiredFields = [
            'titleRu', 'titleEn',
            'descriptionRu', 'descriptionEn',
            'infoTitleRu', 'infoTitleEn',
            'emailLabelRu', 'emailLabelEn',
            'emailValue',
            'telegramLabelRu', 'telegramLabelEn', 'telegramUrl',
            'linkedinLabelRu', 'linkedinLabelEn', 'linkedinUrl',
            'githubLabelRu', 'githubLabelEn', 'githubUrl',
            'formNameLabelRu', 'formNameLabelEn',
            'formEmailLabelRu', 'formEmailLabelEn',
            'formMessageLabelRu', 'formMessageLabelEn',
            'submitLabelRu', 'submitLabelEn',
            'successMessageRu', 'successMessageEn'
        ];
        const hasMissing = requiredFields.some((field) => !req.body[field] || !req.body[field].toString().trim());
        if (hasMissing) {
            return res.status(400).send('Both RU and EN contact fields are required');
        }

        const settings = await getSiteSettings();
        const nextContact = buildContactPayload(req.body, settings.contact);
        await setSiteSetting('contact', nextContact);
        res.redirect('/admin/contact-page');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating contact settings');
    }
};

function normalizeRows(value) {
    return Array.isArray(value) ? value : [];
}

function isValidBackupPayload(parsed) {
    return !!(
        parsed &&
        parsed.format === 'digital-sysadmin-backup' &&
        parsed.data &&
        typeof parsed.data === 'object'
    );
}

function decodeMessage(raw) {
    if (!raw || typeof raw !== 'string') {
        return '';
    }
    try {
        return decodeURIComponent(raw);
    } catch (error) {
        return raw;
    }
}

async function replaceTableContent(model, rows, transaction) {
    const list = normalizeRows(rows);
    await model.destroy({
        where: {},
        truncate: true,
        restartIdentity: true,
        cascade: true,
        transaction
    });
    if (!list.length) {
        return;
    }
    await model.bulkCreate(list, { transaction });
}

async function applyBackupData(parsed) {
    if (!isValidBackupPayload(parsed)) {
        throw new Error('Unsupported backup format');
    }
    await sequelize.transaction(async (transaction) => {
        await replaceTableContent(About, parsed.data.about, transaction);
        await replaceTableContent(Project, parsed.data.projects, transaction);
        await replaceTableContent(Certificate, parsed.data.certificates, transaction);
        await replaceTableContent(Post, parsed.data.posts, transaction);
        await replaceTableContent(Task, parsed.data.tasks, transaction);
        await replaceTableContent(Media, parsed.data.media, transaction);
        await replaceTableContent(SiteSetting, parsed.data.siteSettings, transaction);
    });
}

function safeJoin(basePath, relativePath) {
    const base = path.resolve(basePath);
    const target = path.resolve(base, relativePath);
    if (target === base || target.startsWith(base + path.sep)) {
        return target;
    }
    return null;
}

async function extractUploadsFromZip(directory, uploadsRoot) {
    if (fs.existsSync(uploadsRoot)) {
        fs.rmSync(uploadsRoot, { recursive: true, force: true });
    }
    fs.mkdirSync(uploadsRoot, { recursive: true });

    for (const file of directory.files) {
        if (file.type !== 'File') {
            continue;
        }
        const normalizedPath = (file.path || '').replace(/\\/g, '/');
        if (!normalizedPath.startsWith('uploads/')) {
            continue;
        }

        const relativePath = normalizedPath.slice('uploads/'.length);
        if (!relativePath) {
            continue;
        }

        const destinationPath = safeJoin(uploadsRoot, relativePath);
        if (!destinationPath) {
            continue;
        }

        fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
        await pipeline(file.stream(), fs.createWriteStream(destinationPath));
    }
}

async function buildBackupPayload() {
    const [
        about,
        projects,
        certificates,
        posts,
        tasks,
        media,
        siteSettings
    ] = await Promise.all([
        About.findAll({ order: [['id', 'ASC']] }),
        Project.findAll({ order: [['id', 'ASC']] }),
        Certificate.findAll({ order: [['id', 'ASC']] }),
        Post.findAll({ order: [['id', 'ASC']] }),
        Task.findAll({ order: [['id', 'ASC']] }),
        Media.findAll({ order: [['id', 'ASC']] }),
        SiteSetting.findAll({ order: [['id', 'ASC']] })
    ]);

    return {
        format: 'digital-sysadmin-backup',
        version: 1,
        generatedAt: new Date().toISOString(),
        data: {
            about: about.map(item => item.toJSON()),
            projects: projects.map(item => item.toJSON()),
            certificates: certificates.map(item => item.toJSON()),
            posts: posts.map(item => item.toJSON()),
            tasks: tasks.map(item => item.toJSON()),
            media: media.map(item => item.toJSON()),
            siteSettings: siteSettings.map(item => item.toJSON())
        }
    };
}

exports.manageBackups = async (req, res) => {
    try {
        const stats = {
            about: await About.count(),
            projects: await Project.count(),
            certificates: await Certificate.count(),
            posts: await Post.count(),
            tasks: await Task.count(),
            media: await Media.count(),
            siteSettings: await SiteSetting.count()
        };

        res.render('admin/backups', {
            title: 'Backups',
            stats,
            ok: req.query.ok === '1',
            message: decodeMessage(req.query.message),
            error: decodeMessage(req.query.error)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading backups page');
    }
};

exports.exportBackup = async (req, res) => {
    try {
        const backup = await buildBackupPayload();
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=\"backup-${stamp}.json\"`);
        res.send(JSON.stringify(backup, null, 2));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error exporting backup');
    }
};

exports.exportBackupPackage = async (req, res) => {
    try {
        const backup = await buildBackupPayload();
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        const uploadsRoot = path.join(__dirname, '../public/uploads');

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=\"backup-package-${stamp}.zip\"`);

        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('warning', (warning) => {
            console.warn('Backup package warning:', warning.message);
        });

        archive.on('error', (error) => {
            console.error('Backup package error:', error);
            if (!res.headersSent) {
                res.status(500).send('Error exporting backup package');
            } else {
                res.end();
            }
        });

        archive.pipe(res);
        archive.append(JSON.stringify(backup, null, 2), { name: 'backup.json' });
        if (fs.existsSync(uploadsRoot)) {
            archive.directory(uploadsRoot, 'uploads');
        }
        await archive.finalize();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error exporting backup package');
    }
};

exports.importBackup = async (req, res) => {
    try {
        if (!req.file) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('Backup file is required'));
        }

        let parsed;
        try {
            parsed = JSON.parse(req.file.buffer.toString('utf8'));
        } catch (error) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('Invalid JSON file'));
        }

        if (!isValidBackupPayload(parsed)) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('Unsupported backup format'));
        }

        await applyBackupData(parsed);

        const importedAt = new Date().toISOString();
        const msg = `Backup imported successfully at ${importedAt}`;
        res.redirect('/admin/backups?ok=1&message=' + encodeURIComponent(msg));
    } catch (error) {
        console.error(error);
        res.redirect('/admin/backups?error=' + encodeURIComponent('Import failed: ' + error.message));
    }
};

exports.importBackupPackage = async (req, res) => {
    const zipPath = req.file && req.file.path ? req.file.path : null;
    try {
        if (!zipPath) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('ZIP backup file is required'));
        }

        const directory = await unzipper.Open.file(zipPath);
        const backupEntry = directory.files.find((file) => {
            if (file.type !== 'File') {
                return false;
            }
            return path.basename(file.path || '').toLowerCase() === 'backup.json';
        });

        if (!backupEntry) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('backup.json not found in ZIP'));
        }

        let parsed;
        try {
            parsed = JSON.parse((await backupEntry.buffer()).toString('utf8'));
        } catch (error) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('Invalid backup.json inside ZIP'));
        }

        if (!isValidBackupPayload(parsed)) {
            return res.redirect('/admin/backups?error=' + encodeURIComponent('Unsupported backup format'));
        }

        await applyBackupData(parsed);
        await extractUploadsFromZip(directory, path.join(__dirname, '../public/uploads'));

        const importedAt = new Date().toISOString();
        const msg = `Backup package imported successfully at ${importedAt}`;
        res.redirect('/admin/backups?ok=1&message=' + encodeURIComponent(msg));
    } catch (error) {
        console.error(error);
        res.redirect('/admin/backups?error=' + encodeURIComponent('ZIP import failed: ' + error.message));
    } finally {
        if (zipPath && fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }
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
                content: sanitizeRichContent(section.content ? section.content.toString() : '')
            }))
            .filter(section => section.title || section.content);
    } catch (error) {
        return [];
    }
}

function sanitizeRichContent(html) {
    return sanitizeHtml((html || '').toString(), {
        allowedTags: [
            'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'pre', 'code', 'span', 'strong', 'b', 'em', 'i', 'u', 's',
            'ul', 'ol', 'li', 'a', 'img'
        ],
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
            img: ['src', 'alt', 'title'],
            '*': ['class']
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {
            img: ['http', 'https']
        },
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', {
                rel: 'noopener noreferrer'
            })
        }
    });
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

function parsePublishedDate(value, fallback = null) {
    if (!value) {
        return fallback;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function resolvePostPublication(status, publishedAt, existingPublishedAt = null) {
    const normalizedStatus = status === 'published' || status === 'scheduled' ? status : 'draft';
    const now = new Date();
    const parsedDate = parsePublishedDate(publishedAt, null);
    const currentPublishedAt = parsePublishedDate(existingPublishedAt, null);

    if (normalizedStatus === 'draft') {
        return {
            status: 'draft',
            publishedAt: null
        };
    }

    if (normalizedStatus === 'published') {
        return {
            status: 'published',
            publishedAt: parsedDate || currentPublishedAt || now
        };
    }

    const scheduleDate = parsedDate || currentPublishedAt;
    if (!scheduleDate) {
        return {
            error: 'Scheduled posts require a publish date'
        };
    }

    if (scheduleDate <= now) {
        return {
            status: 'published',
            publishedAt: now
        };
    }

    return {
        status: 'scheduled',
        publishedAt: scheduleDate
    };
}

function isMissingMediaTable(error) {
    const message = (error && error.message ? error.message : '').toLowerCase();
    return (error && error.name === 'SequelizeDatabaseError') &&
        message.includes('media') &&
        (message.includes('does not exist') || message.includes('no such table') || message.includes('relation'));
}

async function getMediaItems() {
    try {
        return await Media.findAll({ order: [['createdAt', 'DESC']] });
    } catch (error) {
        if (isMissingMediaTable(error)) {
            console.warn('Media table is missing. Run `npm run migrate:blog` to enable media library.');
            return [];
        }
        throw error;
    }
}

function hasMeaningfulContent(html) {
    if (!html) {
        return false;
    }
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (text) {
        return true;
    }
    return /<img\s/i.test(html) || /<video\s/i.test(html) || /<iframe\s/i.test(html);
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
        const media = await getMediaItems();
        const sections = buildDefaultSections();
        res.render('admin/editPost', { post: null, sections, media, title: 'Add Post' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post editor');
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, subtitle, excerpt, status, publishedAt, fallbackContent } = req.body;
        let sections = parseSections(req.body.sections);
        if (!sections.length && fallbackContent && fallbackContent.trim()) {
            sections = [{ title: '', content: sanitizeRichContent(fallbackContent) }];
        }
        const firstSection = sections.find(section => hasMeaningfulContent(section.content)) || sections[0];
        const mainContent = firstSection ? firstSection.content : '';

        if (!title || !title.trim()) {
            return res.status(400).send('Title is required');
        }
        if (!sections.length || !hasMeaningfulContent(mainContent)) {
            return res.status(400).send('At least one section with content is required');
        }

        let coverImagePath = null;
        if (req.file) {
            await optimizeUploadedImage(req.file, { maxWidth: 2200, quality: 82 });
            coverImagePath = '/uploads/posts/' + req.file.filename;
        }
        if (!coverImagePath) {
            return res.status(400).send('Cover image is required');
        }

        const publication = resolvePostPublication(status, publishedAt);
        if (publication.error) {
            return res.status(400).send(publication.error);
        }

        await Post.create({ 
            title: title.trim(),
            subtitle: subtitle ? subtitle.trim() : '',
            content: mainContent,
            sections: JSON.stringify(sections),
            excerpt: buildExcerpt(excerpt, mainContent),
            status: publication.status,
            publishedAt: publication.publishedAt,
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
        const media = await getMediaItems();
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

        const { title, subtitle, excerpt, status, publishedAt, fallbackContent } = req.body;
        let sections = parseSections(req.body.sections);
        if (!sections.length && fallbackContent && fallbackContent.trim()) {
            sections = [{ title: '', content: sanitizeRichContent(fallbackContent) }];
        }
        const firstSection = sections.find(section => hasMeaningfulContent(section.content)) || sections[0];
        const mainContent = firstSection ? firstSection.content : '';

        if (!title || !title.trim()) {
            return res.status(400).send('Title is required');
        }
        if (!sections.length || !hasMeaningfulContent(mainContent)) {
            return res.status(400).send('At least one section with content is required');
        }

        const publication = resolvePostPublication(status, publishedAt, post.publishedAt);
        if (publication.error) {
            return res.status(400).send(publication.error);
        }

        const updateData = {
            title: title.trim(),
            subtitle: subtitle ? subtitle.trim() : '',
            content: mainContent,
            sections: JSON.stringify(sections),
            excerpt: buildExcerpt(excerpt, mainContent),
            status: publication.status,
            publishedAt: publication.publishedAt
        };

        if (req.file) {
            await optimizeUploadedImage(req.file, { maxWidth: 2200, quality: 82 });
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
        const media = await getMediaItems();
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
        await optimizeUploadedImage(req.file, { maxWidth: 2400, quality: 82 });
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

exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            order: [['createdAt', 'DESC']],
            limit: 300
        });
        res.render('admin/auditLogs', { logs, title: 'Audit Logs' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading audit logs');
    }
};

exports.manageUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.render('admin/users', {
            title: 'Manage Users',
            users,
            currentUserId: req.session.userId
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading users');
    }
};

exports.createUser = async (req, res) => {
    try {
        const username = (req.body.username || '').trim();
        const password = req.body.password || '';
        const role = req.body.role === 'admin' ? 'admin' : 'editor';

        if (!username || password.length < 6) {
            return res.status(400).send('Username required and password must be at least 6 chars');
        }

        const existing = await User.findOne({ where: { username } });
        if (existing) {
            return res.status(400).send('Username already exists');
        }

        const hash = await bcrypt.hash(password, 10);
        await User.create({
            username,
            password: hash,
            role
        });

        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user');
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (Number(req.session.userId) === Number(user.id)) {
            return res.status(400).send('You cannot change your own role');
        }
        const role = req.body.role === 'admin' ? 'admin' : 'editor';
        await user.update({ role });
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating role');
    }
};

exports.resetUserPassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const nextPassword = req.body.password || '';
        if (nextPassword.length < 6) {
            return res.status(400).send('Password must be at least 6 chars');
        }
        const hash = await bcrypt.hash(nextPassword, 10);
        await user.update({ password: hash });
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error resetting password');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (Number(req.session.userId) === Number(user.id)) {
            return res.status(400).send('You cannot delete yourself');
        }
        await user.destroy();
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
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


