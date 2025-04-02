import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'PriceHistory',
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
            currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'USD' },

            availability: { type: DataTypes.BOOLEAN, defaultValue: true },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            recordedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        { timestamps: true }
    );
};
