import { DataTypes } from 'sequelize';
export default (sequelize) => {
    return sequelize.define(
        'SellerStore',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            sellerId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            storeId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            rating: {
                type: DataTypes.FLOAT,
                allowNull: true,
                validate: { min: 0, max: 5 },
            },
        },
        {
            timestamps: false,
            tableName: 'seller_stores',
        }
    );
};
