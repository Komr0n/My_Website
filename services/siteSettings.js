const { SiteSetting } = require('../models');

const DEFAULT_SITE_SETTINGS = {
    home: {
        heroTitle: 'Komron Juraev - System Administrator & Security Enthusiast',
        heroDescription: 'Networking | Automation | Information Security',
        terminalCommands: [
            'systemctl status network',
            'cat /etc/hostname',
            'ping -c 4 8.8.8.8',
            'ls -la /opt',
            'ps aux | grep nginx',
            'whoami && pwd'
        ],
        buttons: {
            about: 'About Me',
            projects: 'View Projects',
            certificates: 'Certificates',
            contact: 'Contact'
        }
    },
    footer: {
        brandTitle: 'Digital SysAdmin',
        brandDescription: 'System Administrator & Security Enthusiast',
        quickLinks: [
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about' },
            { label: 'Projects', url: '/projects' },
            { label: 'Certificates', url: '/certificates' }
        ],
        socialLinks: [
            { label: 'Telegram', url: 'https://t.me/komron' },
            { label: 'GitHub', url: 'https://github.com/komron' },
            { label: 'LinkedIn', url: 'https://linkedin.com/in/komron' }
        ],
        copyrightYear: new Date().getFullYear(),
        copyrightName: 'Komron Juraev',
        copyrightText: 'All rights reserved.'
    },
    navigation: {
        brandText: '$ cd ~/komron',
        links: [
            { label: 'Home', url: '/' },
            { label: 'About', url: '/about' },
            { label: 'Projects', url: '/projects' },
            { label: 'Certificates', url: '/certificates' },
            { label: 'Contact', url: '/contact' },
            { label: 'Blog', url: '/blog' }
        ],
        showThemeToggle: true
    },
    contact: {
        titleRu: 'Свяжитесь со мной',
        titleEn: 'Get In Touch',
        descriptionRu: 'Есть вопрос или предложение по сотрудничеству? Напишите мне.',
        descriptionEn: 'Have a question or want to work together? Let\'s connect!',
        infoTitleRu: 'Контактная информация',
        infoTitleEn: 'Contact Information',
        emailLabelRu: 'Почта',
        emailLabelEn: 'Email',
        emailValue: 'komron@example.com',
        telegramLabelRu: 'Telegram',
        telegramLabelEn: 'Telegram',
        telegramUrl: 'https://t.me/komron',
        linkedinLabelRu: 'LinkedIn',
        linkedinLabelEn: 'LinkedIn',
        linkedinUrl: 'https://linkedin.com/in/komron',
        githubLabelRu: 'GitHub',
        githubLabelEn: 'GitHub',
        githubUrl: 'https://github.com/komron',
        formNameLabelRu: 'Имя',
        formNameLabelEn: 'Name',
        formEmailLabelRu: 'Почта',
        formEmailLabelEn: 'Email',
        formMessageLabelRu: 'Сообщение',
        formMessageLabelEn: 'Message',
        submitLabelRu: 'Отправить сообщение',
        submitLabelEn: 'Send Message',
        successMessageRu: 'Сообщение успешно отправлено! Я скоро отвечу.',
        successMessageEn: 'Message sent successfully! I\'ll get back to you soon.'
    },
    seo: {
        home: {
            metaTitle: 'Digital SysAdmin - Komron Juraev',
            metaDescription: 'Portfolio of Komron Juraev - System Administrator, Network Specialist, Security Enthusiast',
            ogImage: '/images/default-project.svg'
        },
        about: {
            metaTitle: 'About - Komron Juraev',
            metaDescription: 'About Komron Juraev, system administrator and security enthusiast.',
            ogImage: '/images/default-avatar.svg'
        },
        projects: {
            metaTitle: 'Projects - Komron Juraev',
            metaDescription: 'Selected projects in networking, automation, and security.',
            ogImage: '/images/default-project.svg'
        },
        certificates: {
            metaTitle: 'Certificates - Komron Juraev',
            metaDescription: 'Professional certificates and completed training.',
            ogImage: '/images/default-project.svg'
        },
        contact: {
            metaTitle: 'Contact - Komron Juraev',
            metaDescription: 'Get in touch with Komron Juraev.',
            ogImage: '/images/default-project.svg'
        },
        blog: {
            metaTitle: 'Blog - Komron Juraev',
            metaDescription: 'Blog posts on networking, automation, and information security.',
            ogImage: '/images/default-project.svg'
        },
        blogPost: {
            metaTitle: 'Blog Post - Komron Juraev',
            metaDescription: 'Read this blog post.',
            ogImage: '/images/default-project.svg'
        }
    }
};

const SETTINGS_KEYS = ['home', 'footer', 'navigation', 'contact', 'seo'];
const SEO_PAGES = ['home', 'about', 'projects', 'certificates', 'contact', 'blog', 'blogPost'];

function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
}

function parseJsonValue(raw, fallback) {
    if (!raw) {
        return fallback;
    }
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
}

function mergeSettings(defaults, incoming) {
    const incomingSeo = incoming.seo || {};
    return {
        home: {
            ...defaults.home,
            ...(incoming.home || {}),
            buttons: {
                ...defaults.home.buttons,
                ...((incoming.home && incoming.home.buttons) || {})
            },
            terminalCommands: Array.isArray(incoming.home && incoming.home.terminalCommands)
                ? incoming.home.terminalCommands
                : defaults.home.terminalCommands
        },
        footer: {
            ...defaults.footer,
            ...(incoming.footer || {}),
            quickLinks: Array.isArray(incoming.footer && incoming.footer.quickLinks)
                ? incoming.footer.quickLinks
                : defaults.footer.quickLinks,
            socialLinks: Array.isArray(incoming.footer && incoming.footer.socialLinks)
                ? incoming.footer.socialLinks
                : defaults.footer.socialLinks
        },
        navigation: {
            ...defaults.navigation,
            ...(incoming.navigation || {}),
            links: Array.isArray(incoming.navigation && incoming.navigation.links)
                ? incoming.navigation.links
                : defaults.navigation.links,
            showThemeToggle: typeof (incoming.navigation && incoming.navigation.showThemeToggle) === 'boolean'
                ? incoming.navigation.showThemeToggle
                : defaults.navigation.showThemeToggle
        },
        contact: {
            ...defaults.contact,
            ...(incoming.contact || {})
        },
        seo: SEO_PAGES.reduce((acc, page) => {
            acc[page] = {
                ...defaults.seo[page],
                ...(incomingSeo[page] || {})
            };
            return acc;
        }, {})
    };
}

async function getSiteSettings() {
    const defaults = cloneDefaults();
    const stored = {};
    try {
        const rows = await SiteSetting.findAll({ where: { key: SETTINGS_KEYS } });
        for (const row of rows) {
            stored[row.key] = parseJsonValue(row.value, {});
        }
    } catch (error) {
        return defaults;
    }
    return mergeSettings(defaults, stored);
}

async function setSiteSetting(key, payload) {
    await SiteSetting.upsert({
        key,
        value: JSON.stringify(payload)
    });
}

function normalizeCommands(raw) {
    const defaults = DEFAULT_SITE_SETTINGS.home.terminalCommands;
    const commands = (raw || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    return commands.length ? commands : defaults;
}

function normalizeLinkLines(raw, fallback) {
    const lines = (raw || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const links = lines
        .map(line => {
            const [labelPart, ...urlParts] = line.split('|');
            const label = (labelPart || '').trim();
            const url = urlParts.join('|').trim();
            if (!label || !url) {
                return null;
            }
            return { label, url };
        })
        .filter(Boolean);

    return links.length ? links : fallback;
}

function normalizeSeoText(value, fallback) {
    const trimmed = value ? value.trim() : '';
    return trimmed || fallback;
}

function normalizeOgImage(value, fallback) {
    const trimmed = value ? value.trim() : '';
    return trimmed || fallback;
}

function buildHomePayload(body, current) {
    return {
        heroTitle: body.heroTitle ? body.heroTitle.trim() : current.heroTitle,
        heroDescription: body.heroDescription ? body.heroDescription.trim() : current.heroDescription,
        terminalCommands: normalizeCommands(body.terminalCommands),
        buttons: {
            about: body.buttonAbout ? body.buttonAbout.trim() : current.buttons.about,
            projects: body.buttonProjects ? body.buttonProjects.trim() : current.buttons.projects,
            certificates: body.buttonCertificates ? body.buttonCertificates.trim() : current.buttons.certificates,
            contact: body.buttonContact ? body.buttonContact.trim() : current.buttons.contact
        }
    };
}

function buildFooterPayload(body, current) {
    const fallbackYear = Number(current.copyrightYear) || new Date().getFullYear();
    const yearValue = Number(body.copyrightYear);
    const safeYear = Number.isInteger(yearValue) && yearValue > 1990 && yearValue < 2101
        ? yearValue
        : fallbackYear;

    return {
        brandTitle: body.brandTitle ? body.brandTitle.trim() : current.brandTitle,
        brandDescription: body.brandDescription ? body.brandDescription.trim() : current.brandDescription,
        quickLinks: normalizeLinkLines(body.quickLinks, current.quickLinks),
        socialLinks: normalizeLinkLines(body.socialLinks, current.socialLinks),
        copyrightYear: safeYear,
        copyrightName: body.copyrightName ? body.copyrightName.trim() : current.copyrightName,
        copyrightText: body.copyrightText ? body.copyrightText.trim() : current.copyrightText
    };
}

function buildSeoPayload(body, current) {
    const nextSeo = {};
    for (const page of SEO_PAGES) {
        const pageCurrent = current[page] || DEFAULT_SITE_SETTINGS.seo[page];
        nextSeo[page] = {
            metaTitle: normalizeSeoText(body[`${page}_metaTitle`], pageCurrent.metaTitle),
            metaDescription: normalizeSeoText(body[`${page}_metaDescription`], pageCurrent.metaDescription),
            ogImage: normalizeOgImage(body[`${page}_ogImage`], pageCurrent.ogImage)
        };
    }
    return nextSeo;
}

function buildNavigationPayload(body, current) {
    return {
        brandText: body.brandText ? body.brandText.trim() : current.brandText,
        links: normalizeLinkLines(body.links, current.links),
        showThemeToggle: body.showThemeToggle === 'on'
    };
}

function buildContactPayload(body, current) {
    const safe = (value, fallback) => {
        const trimmed = value ? value.trim() : '';
        return trimmed || fallback;
    };
    const legacy = (nextKey, oldKey, fallback = '') => {
        const value = current[nextKey] || current[oldKey];
        return typeof value === 'string' && value.trim() ? value : fallback;
    };

    return {
        titleRu: safe(body.titleRu, legacy('titleRu', 'title', DEFAULT_SITE_SETTINGS.contact.titleRu)),
        titleEn: safe(body.titleEn, legacy('titleEn', 'title', DEFAULT_SITE_SETTINGS.contact.titleEn)),
        descriptionRu: safe(body.descriptionRu, legacy('descriptionRu', 'description', DEFAULT_SITE_SETTINGS.contact.descriptionRu)),
        descriptionEn: safe(body.descriptionEn, legacy('descriptionEn', 'description', DEFAULT_SITE_SETTINGS.contact.descriptionEn)),
        infoTitleRu: safe(body.infoTitleRu, legacy('infoTitleRu', 'infoTitle', DEFAULT_SITE_SETTINGS.contact.infoTitleRu)),
        infoTitleEn: safe(body.infoTitleEn, legacy('infoTitleEn', 'infoTitle', DEFAULT_SITE_SETTINGS.contact.infoTitleEn)),
        emailLabelRu: safe(body.emailLabelRu, legacy('emailLabelRu', 'emailLabel', DEFAULT_SITE_SETTINGS.contact.emailLabelRu)),
        emailLabelEn: safe(body.emailLabelEn, legacy('emailLabelEn', 'emailLabel', DEFAULT_SITE_SETTINGS.contact.emailLabelEn)),
        emailValue: safe(body.emailValue, current.emailValue || DEFAULT_SITE_SETTINGS.contact.emailValue),
        telegramLabelRu: safe(body.telegramLabelRu, legacy('telegramLabelRu', 'telegramLabel', DEFAULT_SITE_SETTINGS.contact.telegramLabelRu)),
        telegramLabelEn: safe(body.telegramLabelEn, legacy('telegramLabelEn', 'telegramLabel', DEFAULT_SITE_SETTINGS.contact.telegramLabelEn)),
        telegramUrl: safe(body.telegramUrl, current.telegramUrl || DEFAULT_SITE_SETTINGS.contact.telegramUrl),
        linkedinLabelRu: safe(body.linkedinLabelRu, legacy('linkedinLabelRu', 'linkedinLabel', DEFAULT_SITE_SETTINGS.contact.linkedinLabelRu)),
        linkedinLabelEn: safe(body.linkedinLabelEn, legacy('linkedinLabelEn', 'linkedinLabel', DEFAULT_SITE_SETTINGS.contact.linkedinLabelEn)),
        linkedinUrl: safe(body.linkedinUrl, current.linkedinUrl || DEFAULT_SITE_SETTINGS.contact.linkedinUrl),
        githubLabelRu: safe(body.githubLabelRu, legacy('githubLabelRu', 'githubLabel', DEFAULT_SITE_SETTINGS.contact.githubLabelRu)),
        githubLabelEn: safe(body.githubLabelEn, legacy('githubLabelEn', 'githubLabel', DEFAULT_SITE_SETTINGS.contact.githubLabelEn)),
        githubUrl: safe(body.githubUrl, current.githubUrl || DEFAULT_SITE_SETTINGS.contact.githubUrl),
        formNameLabelRu: safe(body.formNameLabelRu, legacy('formNameLabelRu', 'formNameLabel', DEFAULT_SITE_SETTINGS.contact.formNameLabelRu)),
        formNameLabelEn: safe(body.formNameLabelEn, legacy('formNameLabelEn', 'formNameLabel', DEFAULT_SITE_SETTINGS.contact.formNameLabelEn)),
        formEmailLabelRu: safe(body.formEmailLabelRu, legacy('formEmailLabelRu', 'formEmailLabel', DEFAULT_SITE_SETTINGS.contact.formEmailLabelRu)),
        formEmailLabelEn: safe(body.formEmailLabelEn, legacy('formEmailLabelEn', 'formEmailLabel', DEFAULT_SITE_SETTINGS.contact.formEmailLabelEn)),
        formMessageLabelRu: safe(body.formMessageLabelRu, legacy('formMessageLabelRu', 'formMessageLabel', DEFAULT_SITE_SETTINGS.contact.formMessageLabelRu)),
        formMessageLabelEn: safe(body.formMessageLabelEn, legacy('formMessageLabelEn', 'formMessageLabel', DEFAULT_SITE_SETTINGS.contact.formMessageLabelEn)),
        submitLabelRu: safe(body.submitLabelRu, legacy('submitLabelRu', 'submitLabel', DEFAULT_SITE_SETTINGS.contact.submitLabelRu)),
        submitLabelEn: safe(body.submitLabelEn, legacy('submitLabelEn', 'submitLabel', DEFAULT_SITE_SETTINGS.contact.submitLabelEn)),
        successMessageRu: safe(body.successMessageRu, legacy('successMessageRu', 'successMessage', DEFAULT_SITE_SETTINGS.contact.successMessageRu)),
        successMessageEn: safe(body.successMessageEn, legacy('successMessageEn', 'successMessage', DEFAULT_SITE_SETTINGS.contact.successMessageEn))
    };
}

module.exports = {
    DEFAULT_SITE_SETTINGS,
    SEO_PAGES,
    getSiteSettings,
    setSiteSetting,
    buildHomePayload,
    buildFooterPayload,
    buildSeoPayload,
    buildNavigationPayload,
    buildContactPayload
};
