import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'Coupon',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            storeId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            discount: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            expiryDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        { timestamps: true }
    );
};
