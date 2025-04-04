import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
// dotenv.config();
dotenv.config({ path: './.env' });

// dotenv.config({ path: './.env' });
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});

export const connectDB = async () => {
    try {
        sequelize
            .sync({ force: true }) // This will ensure all models are synchronized
            .then(() => console.log('Database is up to date'))
            .catch((err) => console.error('Sync error:', err));
        await sequelize.authenticate();
        console.log('database connected successfully.');
    } catch (error) {
        console.error('database connection failed:', error);
        //process.exit(1);
    }
};
