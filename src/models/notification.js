import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'Notification',
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
            message: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        { timestamps: true }
    );
};
