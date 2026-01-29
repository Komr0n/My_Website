const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const baseOptions = {
    dialect: 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
        max: Number(process.env.DB_POOL_MAX || 10),
        min: Number(process.env.DB_POOL_MIN || 0),
        acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
        idle: Number(process.env.DB_POOL_IDLE || 10000)
    }
};

const sslEnabled = isProduction && process.env.DB_SSL !== 'false';
if (sslEnabled) {
    baseOptions.dialectOptions = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    };
}

let sequelize;
if (databaseUrl) {
    sequelize = new Sequelize(databaseUrl, baseOptions);
} else {
    const dbName = process.env.DB_NAME || 'my_website';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPass = process.env.DB_PASS || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = Number(process.env.DB_PORT || 5432);

    sequelize = new Sequelize(dbName, dbUser, dbPass, {
        ...baseOptions,
        host: dbHost,
        port: dbPort
    });
}

module.exports = { sequelize };

