import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/notification.js';
export const getAllNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.findAll();
    res.json(notifications);
});
