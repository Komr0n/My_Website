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
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    featuredImage: {
        type: DataTypes.STRING,
        defaultValue: null
    }
}, {
    hooks: {
        beforeCreate: (post) => {
            if (!post.slug) {
                post.slug = post.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }
        }
    }
});

module.exports = Post;


