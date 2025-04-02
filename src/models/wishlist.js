import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'Wishlist',
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
        },
        { timestamps: true }
    );
};
