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
            surename: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    len: {
                        args: [2, 30],
                        msg: 'Name must be between 2 and 30 characters',
                    },
                },
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: 'Email must be a valid email address',
                    },
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
            tableName: 'Users', // explicitly set table name in database
            timestamps: false, // disable Sequelize's default timestamp fields
        }
    );

    return User;
};
