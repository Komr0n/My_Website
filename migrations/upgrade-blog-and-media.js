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

    await sequelize.close();
}

run().catch(async (error) => {
    console.error(error);
    await sequelize.close();
    process.exit(1);
});
