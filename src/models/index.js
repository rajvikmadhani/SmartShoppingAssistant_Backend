import { sequelize } from '../db/index.js';
import UserModel from './user.js';

// Initialize models
const User = UserModel(sequelize);

// Ensuring all models are loaded correctly
const models = { User };
Object.entries(models).forEach(([name, model]) => {
    if (!model) {
        console.warn(`Warning: Model ${name} was not loaded correctly.`);
    } else {
        console.log(`Model ${name} loaded successfully.`);
    }
});

export default models;
