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
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            brand: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            ram_gb: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            storage_gb: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            color: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            mainImgUrl: {
                type: DataTypes.STRING,
            },
        },
        { timestamps: true }
    );
};
