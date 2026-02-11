const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

async function tableExists(queryInterface, tableName) {
    try {
        await queryInterface.describeTable(tableName);
        return true;
    } catch (error) {
        return false;
    }
}

async function addColumnIfMissing(queryInterface, tableName, columnName, definition) {
    const table = await queryInterface.describeTable(tableName);
    if (!table[columnName]) {
        await queryInterface.addColumn(tableName, columnName, definition);
    }
}

async function run() {
    const queryInterface = sequelize.getQueryInterface();

    if (await tableExists(queryInterface, 'Posts')) {
        await addColumnIfMissing(queryInterface, 'Posts', 'subtitle', {
            type: DataTypes.STRING,
            defaultValue: ''
        });
        await addColumnIfMissing(queryInterface, 'Posts', 'sections', {
            type: DataTypes.TEXT,
            defaultValue: null
        });
        await addColumnIfMissing(queryInterface, 'Posts', 'status', {
            type: DataTypes.STRING,
            defaultValue: 'draft'
        });
        await addColumnIfMissing(queryInterface, 'Posts', 'publishedAt', {
            type: DataTypes.DATE,
            defaultValue: null
        });
        await addColumnIfMissing(queryInterface, 'Posts', 'coverImage', {
            type: DataTypes.STRING,
            defaultValue: null
        });

        await sequelize.query(`UPDATE "Posts" SET "coverImage" = "featuredImage" WHERE "coverImage" IS NULL AND "featuredImage" IS NOT NULL;`);

        const columns = await queryInterface.describeTable('Posts');
        if (columns.published) {
            await sequelize.query(`UPDATE "Posts" SET "status" = 'published' WHERE "published" = 1 OR "published" = true;`);
            await sequelize.query(`UPDATE "Posts" SET "publishedAt" = COALESCE("publishedAt", "createdAt") WHERE "status" = 'published';`);
        }
        await sequelize.query(`UPDATE "Posts" SET "status" = 'scheduled' WHERE "status" = 'published' AND "publishedAt" IS NOT NULL AND "publishedAt" > CURRENT_TIMESTAMP;`);
    }

    if (await tableExists(queryInterface, 'Abouts')) {
        await addColumnIfMissing(queryInterface, 'Abouts', 'titleEn', {
            type: DataTypes.STRING,
            defaultValue: ''
        });
        await addColumnIfMissing(queryInterface, 'Abouts', 'contentEn', {
            type: DataTypes.TEXT,
            defaultValue: ''
        });
        await addColumnIfMissing(queryInterface, 'Abouts', 'skillsEn', {
            type: DataTypes.TEXT,
            defaultValue: ''
        });
        await sequelize.query(`UPDATE "Abouts" SET "titleEn" = "title" WHERE "titleEn" IS NULL OR "titleEn" = '';`);
        await sequelize.query(`UPDATE "Abouts" SET "contentEn" = "content" WHERE "contentEn" IS NULL OR "contentEn" = '';`);
        await sequelize.query(`UPDATE "Abouts" SET "skillsEn" = "skills" WHERE "skillsEn" IS NULL OR "skillsEn" = '';`);
    }

    if (await tableExists(queryInterface, 'Projects')) {
        await addColumnIfMissing(queryInterface, 'Projects', 'titleEn', {
            type: DataTypes.STRING,
            defaultValue: ''
        });
        await addColumnIfMissing(queryInterface, 'Projects', 'descriptionEn', {
            type: DataTypes.TEXT,
            defaultValue: ''
        });
        await addColumnIfMissing(queryInterface, 'Projects', 'technologiesEn', {
            type: DataTypes.TEXT,
            defaultValue: ''
        });
        await sequelize.query(`UPDATE "Projects" SET "titleEn" = "title" WHERE "titleEn" IS NULL OR "titleEn" = '';`);
        await sequelize.query(`UPDATE "Projects" SET "descriptionEn" = "description" WHERE "descriptionEn" IS NULL OR "descriptionEn" = '';`);
        await sequelize.query(`UPDATE "Projects" SET "technologiesEn" = "technologies" WHERE "technologiesEn" IS NULL OR "technologiesEn" = '';`);
    }

    if (await tableExists(queryInterface, 'Certificates')) {
        await addColumnIfMissing(queryInterface, 'Certificates', 'titleEn', {
            type: DataTypes.STRING,
            defaultValue: ''
        });
        await addColumnIfMissing(queryInterface, 'Certificates', 'descriptionEn', {
            type: DataTypes.TEXT,
            defaultValue: ''
        });
        await sequelize.query(`UPDATE "Certificates" SET "titleEn" = "title" WHERE "titleEn" IS NULL OR "titleEn" = '';`);
        await sequelize.query(`UPDATE "Certificates" SET "descriptionEn" = COALESCE("description", '') WHERE "descriptionEn" IS NULL OR "descriptionEn" = '';`);
        await sequelize.query(`UPDATE "Certificates" SET "description" = '' WHERE "description" IS NULL;`);
    }

    if (await tableExists(queryInterface, 'Users')) {
        await addColumnIfMissing(queryInterface, 'Users', 'role', {
            type: DataTypes.STRING,
            defaultValue: 'editor'
        });
        await sequelize.query(`UPDATE "Users" SET "role" = 'editor' WHERE "role" IS NULL OR "role" = '';`);
        await sequelize.query(`UPDATE "Users" SET "role" = 'admin' WHERE "username" = 'admin';`);
    }

    if (!await tableExists(queryInterface, 'Tasks')) {
        await queryInterface.createTable('Tasks', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            title: { type: DataTypes.STRING, allowNull: false },
            description: { type: DataTypes.TEXT, defaultValue: '' },
            completed: { type: DataTypes.BOOLEAN, defaultValue: false },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
    }

    if (!await tableExists(queryInterface, 'Media')) {
        await queryInterface.createTable('Media', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            filename: { type: DataTypes.STRING, allowNull: false },
            originalName: { type: DataTypes.STRING, allowNull: false },
            url: { type: DataTypes.STRING, allowNull: false },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
    }

    if (!await tableExists(queryInterface, 'SiteSettings')) {
        await queryInterface.createTable('SiteSettings', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            key: { type: DataTypes.STRING, allowNull: false, unique: true },
            value: { type: DataTypes.TEXT, allowNull: false },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
    }

    if (!await tableExists(queryInterface, 'AuditLogs')) {
        await queryInterface.createTable('AuditLogs', {
            id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
            userId: { type: DataTypes.INTEGER, allowNull: true },
            username: { type: DataTypes.STRING, allowNull: false },
            role: { type: DataTypes.STRING, allowNull: false },
            method: { type: DataTypes.STRING, allowNull: false },
            path: { type: DataTypes.STRING, allowNull: false },
            statusCode: { type: DataTypes.INTEGER, allowNull: false },
            ipAddress: { type: DataTypes.STRING, allowNull: true },
            userAgent: { type: DataTypes.TEXT, allowNull: true },
            details: { type: DataTypes.TEXT, allowNull: true },
            createdAt: { type: DataTypes.DATE, allowNull: false },
            updatedAt: { type: DataTypes.DATE, allowNull: false }
        });
    }

    await sequelize.close();
}

run().catch(async (error) => {
    console.error(error);
    await sequelize.close();
    process.exit(1);
});
