import { sequelize } from './index.js';
import models from '../models/index.js';

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully!');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        process.exit();
    }
};

syncDatabase();
