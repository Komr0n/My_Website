const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

async function addFeaturedImageColumn() {
    try {
        // Проверяем, существует ли колонка
        const [results] = await sequelize.query(`
            PRAGMA table_info(Posts);
        `);
        
        const hasColumn = results.some(col => col.name === 'featuredImage');
        
        if (!hasColumn) {
            console.log('Adding featuredImage column to Posts table...');
            await sequelize.query(`
                ALTER TABLE Posts ADD COLUMN featuredImage VARCHAR(255) DEFAULT NULL;
            `);
            console.log('✓ Column featuredImage added successfully!');
        } else {
            console.log('✓ Column featuredImage already exists.');
        }
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error adding column:', error);
        await sequelize.close();
        process.exit(1);
    }
}

addFeaturedImageColumn();

