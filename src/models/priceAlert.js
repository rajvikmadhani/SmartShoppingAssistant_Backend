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
            threshold: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            color: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            ram_gb: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            storage_gb: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            isDisabled: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },

            lastNotifiedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            timestamps: true,
        }
    );
};
