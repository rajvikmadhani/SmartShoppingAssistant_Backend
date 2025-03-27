import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import Notification from '../models/notification.js';

export const getAllNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.findAll();
    res.json(notifications);
});

// Create a new notification
export const createNotification = asyncHandler(async (req, res, next) => {
    const { userId, message, read } = req.body;

    // Validate required fields
    if (!userId || !message) {
        return next(new ErrorResponse('User ID and message are required', 400));
    }

    // Create the notification
    const notification = await Notification.create({
        userId,
        message,
        read: read || false, // Default to false if not provided
    });

    res.status(201).json({
        message: 'Notification created successfully',
        notification,
    });
});

// Mark a notification as read
export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find the notification by ID
    const notification = await Notification.findByPk(id);
    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    // Update the notification's read status
    notification.read = true;
    await notification.save();

    res.json({
        message: 'Notification marked as read successfully',
        notification,
    });
});
