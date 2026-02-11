const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
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
    image: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    descriptionEn: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    },
    issueDate: {
        type: DataTypes.DATE
    }
});

module.exports = Certificate;


