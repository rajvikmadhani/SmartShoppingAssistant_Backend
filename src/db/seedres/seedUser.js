import bcrypt from 'bcrypt';
import { sequelize } from '../index.js'; // Ensure correct path
import UserModel from '../models/User.js'; // Ensure correct path

const seedUsers = async () => {
    try {
        await sequelize.sync({ force: true }); // Reset database (use with caution)

        const User = UserModel(sequelize);

        const users = [
            {
                name: 'Alireza',
                surname: 'Doagooei',
                email: 'Alireza@example.com',
                password: await bcrypt.hash('12345678', 10),
                street: '123 Main St',
                city: 'Munich',
                zipcode: '12345',
                about: 'I am attending WBS bootcamp.',
                phone: '1234567890',
            },
            {
                name: 'Rajvi',
                surname: 'Madhani',
                email: 'Rajvi@example.com',
                password: await bcrypt.hash('12345678', 10),
                street: 'Example street 456',
                city: 'Berlin',
                zipcode: '90001',
                about: 'Data scientist',
                phone: '0987654321',
            },
        ];

        await User.bulkCreate(users);
        console.log('Users seeded successfully.');

        process.exit(0); // Exit after completion
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
