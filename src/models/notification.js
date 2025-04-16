import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'Notification',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            priceAlertId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            productImage: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            currentPrice: {
                type: DataTypes.FLOAT,
                allowNull: true,
            },
            storeName: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            productLink: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        { timestamps: true }
    );
};
