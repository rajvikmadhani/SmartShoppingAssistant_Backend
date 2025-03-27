import PriceAlert from '../models/priceAlert.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
// Set a price alert
export const setPriceAlert = asyncHandler(async (req, res, next) => {
    const { userId, productId, targetPrice } = req.body;
    const alert = await PriceAlert.create({ userId, productId, targetPrice });
    res.status(201).json(alert);
});

// Get price alerts for a user
export const getPriceAlerts = asyncHandler(async (req, res, next) => {
    const alerts = await PriceAlert.findAll({ where: { userId: req.params.userId } });
    res.json(alerts);
});

// Delete a price alert
export const deletePriceAlert = asyncHandler(async (req, res, next) => {
    const alert = await PriceAlert.findByPk(req.params.id);
    if (!alert) {
        return next(new ErrorResponse('Price alert not found', 404));
    }
    await alert.destroy();
    res.json({ message: 'Price alert deleted successfully' });
});

// Create a new price alert
export const createPriceAlert = asyncHandler(async (req, res, next) => {
    const { userId, productId, targetPrice } = req.body;

    // Validate required fields
    if (!userId || !productId || !targetPrice) {
        return next(new ErrorResponse('User ID, Product ID, and Target Price are required', 400));
    }

    // Check if a price alert already exists for the same user and product
    const existingAlert = await PriceAlert.findOne({
        where: { userId, productId },
    });

    if (existingAlert) {
        return next(new ErrorResponse('A price alert for this product already exists', 400));
    }

    // Create the price alert
    const priceAlert = await PriceAlert.create({
        userId,
        productId,
        targetPrice,
    });

    res.status(201).json({
        message: 'Price alert created successfully',
        priceAlert,
    });
});
// Get all price alerts
export const getAllPriceAlerts = asyncHandler(async (req, res, next) => {
    const priceAlerts = await PriceAlert.findAll();

    if (!priceAlerts || priceAlerts.length === 0) {
        return next(new ErrorResponse('No price alerts found', 404));
    }

    res.json({
        message: 'Price alerts retrieved successfully',
        priceAlerts,
    });
});
