const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    titleEn: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    descriptionEn: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    technologies: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    technologiesEn: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    image: {
        type: DataTypes.STRING,
        defaultValue: '/images/default-project.svg'
    },
    githubLink: {
        type: DataTypes.STRING
    },
    liveLink: {
        type: DataTypes.STRING
    }
});

module.exports = Project;

