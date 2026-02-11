const { About, Project, Certificate, Post } = require('../models');
const { Op } = require('sequelize');
const sanitizeHtml = require('sanitize-html');

function getCurrentLang(req) {
    return req.session && req.session.lang === 'en' ? 'en' : 'ru';
}

function localizeAbout(about, lang) {
    if (!about || lang !== 'en') {
        return about;
    }
    return {
        ...about.toJSON(),
        title: about.titleEn || about.title,
        content: about.contentEn || about.content,
        skills: about.skillsEn || about.skills
    };
}

function localizeProject(project, lang) {
    if (!project || lang !== 'en') {
        return project;
    }
    return {
        ...project.toJSON(),
        title: project.titleEn || project.title,
        description: project.descriptionEn || project.description,
        technologies: project.technologiesEn || project.technologies
    };
}

function localizeCertificate(certificate, lang) {
    if (!certificate || lang !== 'en') {
        return certificate;
    }
    return {
        ...certificate.toJSON(),
        title: certificate.titleEn || certificate.title,
        description: certificate.descriptionEn || certificate.description
    };
}

function sanitizePostSectionHtml(html) {
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
        }
    });
}

async function publishDueScheduledPosts() {
    await Post.update(
        { status: 'published' },
        {
            where: {
                status: 'scheduled',
                publishedAt: { [Op.lte]: new Date() }
            }
        }
    );
}

exports.getAbout = async (req, res) => {
    try {
        const lang = getCurrentLang(req);
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

        const localizedAbout = localizeAbout(about, lang);

        if (req.path === '/') {
            res.render('index', {
                about: localizedAbout,
                title: 'Digital SysAdmin',
                seoPageKey: 'home'
            });
        } else {
            res.render('about', {
                about: localizedAbout,
                title: lang === 'en' ? 'About' : 'O sebe',
                seoPageKey: 'about'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading about page');
    }
};

exports.getProjects = async (req, res) => {
    try {
        const lang = getCurrentLang(req);
        const projects = await Project.findAll({ order: [['createdAt', 'DESC']] });
        const localizedProjects = projects.map(project => localizeProject(project, lang));
        res.render('projects', {
            projects: localizedProjects,
            title: lang === 'en' ? 'Projects' : 'Proekty',
            seoPageKey: 'projects'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading projects');
    }
};

exports.getCertificates = async (req, res) => {
    try {
        const lang = getCurrentLang(req);
        const certificates = await Certificate.findAll({ order: [['issueDate', 'DESC']] });
        const localizedCertificates = certificates.map(certificate => localizeCertificate(certificate, lang));
        res.render('certificates', {
            certificates: localizedCertificates,
            title: lang === 'en' ? 'Certificates' : 'Sertifikaty',
            seoPageKey: 'certificates'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading certificates');
    }
};

exports.getPosts = async (req, res) => {
    try {
        await publishDueScheduledPosts();
        const posts = await Post.findAll({
            where: {
                status: 'published',
                publishedAt: { [Op.lte]: new Date() }
            },
            order: [['publishedAt', 'DESC']]
        });
        res.render('posts', { posts, title: 'Blog', seoPageKey: 'blog' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading posts');
    }
};

exports.getPost = async (req, res) => {
    try {
        await publishDueScheduledPosts();
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
        sections = sections.map(section => ({
            title: section && section.title ? section.title : '',
            content: sanitizePostSectionHtml(section && section.content ? section.content : '')
        }));

        res.render('post', {
            post,
            sections,
            title: post.title,
            seoPageKey: 'blogPost',
            seoMeta: {
                metaTitle: `${post.title} - Komron Juraev`,
                metaDescription: (post.excerpt || post.content || '')
                    .replace(/<[^>]*>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .substring(0, 160) || 'Read this blog post.',
                ogImage: post.coverImage || post.featuredImage || '/images/default-project.svg'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading post');
    }
};
