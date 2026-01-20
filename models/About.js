const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const About = sequelize.define('About', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: 'About Me'
    },
    content: {
        type: DataTypes.TEXT,
        defaultValue: 'System Administrator & Security Enthusiast'
    },
    skills: {
        type: DataTypes.TEXT,
        defaultValue: 'RouterOS, Windows Server, Linux, Zabbix, Python, C#'
    },
    avatar: {
        type: DataTypes.STRING,
        defaultValue: '/images/default-avatar.svg'
    }
});

module.exports = About;

