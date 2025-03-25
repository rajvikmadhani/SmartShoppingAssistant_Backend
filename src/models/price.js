import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'Price',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            productId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            storeId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            shippingCost: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
            },
            discount: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
            },
            lastUpdated: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        { timestamps: true }
    );
};
