import bcrypt from 'bcrypt';
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    len: {
                        args: [2, 30],
                        msg: 'Name must be between 2 and 30 characters',
                    },
                },
            },
            surname: {
                // Fixed typo from 'surename'
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    len: {
                        args: [2, 30],
                        msg: 'Surname must be between 2 and 30 characters',
                    },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: { msg: 'Email already in use' },
                validate: {
                    isEmail: { msg: 'Email must be a valid email address' },
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    len: {
                        args: [8, 100],
                        msg: 'Password must be between 8 and 100 characters',
                    },
                },
            },
            street: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    len: {
                        args: [5, 100],
                        msg: 'Street must be between 5 and 100 characters',
                    },
                },
            },
            city: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    len: {
                        args: [2, 50],
                        msg: 'City must be between 2 and 50 characters',
                    },
                },
            },
            zipcode: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    is: {
                        args: [/^\d{5,10}$/],
                        msg: 'Zipcode must be between 5 and 10 digits',
                    },
                },
            },
            about: {
                type: DataTypes.TEXT,
                allowNull: true,
                validate: {
                    len: {
                        args: [10, 500],
                        msg: 'About must be between 10 and 500 characters',
                    },
                },
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    is: {
                        args: [/^\+?[0-9\s\-]{10,15}$/],
                        msg: 'Phone number must be between 10 and 15 characters',
                    },
                },
            },
        },
        {
            defaultScope: {
                attributes: { exclude: ['password'] },
            },
            scopes: {
                withPassword: {
                    attributes: { include: ['password'] },
                },
            },
            hooks: {
                beforeCreate: async (user) => {
                    user.password = await bcrypt.hash(user.password, 10);
                },
                beforeUpdate: async (user) => {
                    if (user.changed('password')) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
            },
            tableName: 'Users',
            timestamps: true, // Now storing createdAt and updatedAt
        }
    );

    return User;
};
