const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(dbDir, 'database.sqlite'),
    logging: false
});

module.exports = { sequelize };

