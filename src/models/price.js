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
                references: {
                    model: 'Products', // Reference the correct table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            mainImgUrl: {
                type: DataTypes.STRING,
            },
            color: {
                type: DataTypes.STRING,
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
            sellerStoreId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'SellerStores', // Reference the correct table
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            product_link: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            currency: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            product_rating: {
                type: DataTypes.STRING, // or DECIMAL if you want to parse to a float later
                allowNull: true,
            },
            availability: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            shippingCost: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            discount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0.0,
            },
            lastUpdated: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    name: 'price_variant_unique_index',
                    fields: ['productId', 'color', 'ram_gb', 'storage_gb', 'sellerStoreId', 'product_link'],
                },
            ],
        }
    );
};
