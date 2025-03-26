import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import ScrapingJob from '../models/scrapingJob.js';
import Price from '../models/price.js';
import Notification from '../models/notification.js';
import Coupon from '../models/coupon.js';
export const getAllNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.findAll();
    res.json(notifications);
});
