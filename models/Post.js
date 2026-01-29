const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtitle: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sections: {
        type: DataTypes.TEXT,
        defaultValue: null
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'draft'
    },
    publishedAt: {
        type: DataTypes.DATE,
        defaultValue: null
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    coverImage: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    featuredImage: {
        type: DataTypes.STRING,
        defaultValue: null
    }
}, {
    hooks: {
        beforeCreate: async (post) => {
            if (!post.slug) {
                post.slug = await generateUniqueSlug(post.title);
            }
        },
        beforeUpdate: async (post) => {
            if (!post.slug && post.title) {
                post.slug = await generateUniqueSlug(post.title);
            }
        }
    }
});

function slugifyTitle(title) {
    if (!title) {
        return '';
    }
    return title
        .toString()
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function generateUniqueSlug(title) {
    let base = slugifyTitle(title);
    if (!base) {
        base = `post-${Date.now()}`;
    }
    let slug = base;
    let counter = 2;
    while (await Post.findOne({ where: { slug } })) {
        slug = `${base}-${counter}`;
        counter += 1;
    }
    return slug;
}

module.exports = Post;


