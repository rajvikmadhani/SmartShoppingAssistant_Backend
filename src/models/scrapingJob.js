import { DataTypes } from 'sequelize';

export default (sequelize) => {
    return sequelize.define(
        'ScrapingJob',
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
            status: {
                type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
                defaultValue: 'pending',
            },
            startedAt: {
                type: DataTypes.DATE,
            },
            completedAt: {
                type: DataTypes.DATE,
            },
            errorMessage: {
                type: DataTypes.TEXT,
            },
        },
        { timestamps: true }
    );
};
