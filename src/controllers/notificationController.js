import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// controllers/notificationController.js
import models from '../models/index.js';

export const getUserNotifications = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.user.id; // assuming user is authenticated

        const notifications = await models.Notification.findAll({
            include: {
                model: models.PriceAlert,
                where: { userId },
                include: {
                    model: models.Product,
                    attributes: ['id', 'name'],
                },
            },
            order: [['createdAt', 'DESC']],
        });

        res.json(notifications);
    } catch (error) {
        console.error('❌ Failed to fetch notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});

// Mark a notification as read
export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find the notification by ID
    const notification = await models.Notification.findByPk(id);
    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    // Update the notification's read status
    notification.set('isRead', true);
    await notification.save({ fields: ['isRead'] });

    res.json({
        message: 'Notification marked as read successfully',
        notification,
    });
});
