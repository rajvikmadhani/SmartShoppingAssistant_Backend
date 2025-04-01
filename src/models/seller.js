import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Seller = sequelize.define(
        'Seller',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            contact_info: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        { timestamps: true }
    );

    return Seller;
};
