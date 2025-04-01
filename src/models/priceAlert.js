import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'PriceAlert',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            productId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            targetPrice: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            isNotified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        { timestamps: true }
    );
};
