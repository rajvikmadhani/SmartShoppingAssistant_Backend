// priceHistory.js
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
            priceId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Prices',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },

            currency: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '$',
            },
            availability: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
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
