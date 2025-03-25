import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Store = sequelize.define(
        'Store',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            website: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: true,
                },
            },
        },
        {
            tableName: 'stores',
            timestamps: true,
        }
    );

    return Store;
};
