import PriceAlert from '../models/priceAlert.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
// Set a price alert
export const createPriceAlert = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { productId, threshold, color, ram_gb, storage_gb } = req.body;

    if (!productId || !threshold) {
        return res.status(400).json({ message: 'Product ID and threshold are required' });
    }

    const [alert, created] = await models.PriceAlert.findOrCreate({
        where: {
            userId,
            productId,
            color: color?.trim().toLowerCase() || null,
            ram_gb: ram_gb ?? null,
            storage_gb: storage_gb ?? null,
        },
        defaults: {
            threshold: parseFloat(threshold),
        },
    });

    if (!created) {
        return res.status(409).json({ message: 'Alert already exists for this variant' });
    }

    return res.status(201).json(alert);
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
