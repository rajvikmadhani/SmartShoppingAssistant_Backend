import { col, DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'Product',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            brand: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        { timestamps: true }
    );
};
