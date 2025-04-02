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
            //Each product can have multiple store listings (Amazon, eBay, Walmart, etc.).
            // The product price and availability differ by store.
            product_link: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            currency: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            availability: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            shippingCost: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
            },
            discount: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
            },
            seller_rating: {
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
