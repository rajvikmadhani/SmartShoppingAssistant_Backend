import PriceAlert from '../models/priceAlert.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
// Set a price alert
export const createPriceAlert = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { productId, threshold, color, ram_gb, storage_gb } = req.body;

    const [alert, created] = await models.PriceAlert.findOrCreate({
        where: {
            userId,
            productId,
            color: color?.trim().toLowerCase() || null,
            ram_gb: ram_gb ?? null,
            storage_gb,
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

// Delete a price alert
export const deletePriceAlert = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const alertId = req.params.id;

    const alert = await models.PriceAlert.findOne({
        where: { id: alertId, userId },
    });

    if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
    }

    await alert.destroy();
    res.json({ message: 'Alert deleted successfully' });
});

// Get all price alerts
export const getAllPriceAlerts = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const alerts = await models.PriceAlert.findAll({
        where: { userId },
        include: [
            {
                model: models.Product,
                attributes: ['id', 'name', 'brand'],
            },
        ],
        order: [['createdAt', 'DESC']],
    });

    res.json(alerts);
});
