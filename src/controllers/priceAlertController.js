import models from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
// Set a price alert
export const createPriceAlert = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { productId, threshold, storage_gb } = req.body;

    if (!productId || !threshold || !storage_gb) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const existing = await models.PriceAlert.findOne({
            where: {
                userId,
                productId,
                storage_gb,
            },
        });

        if (existing) {
            return res.status(409).json({ message: 'Alert already exists for this product variant.' });
        }

        const alert = await models.PriceAlert.create({
            userId,
            productId,
            threshold: parseFloat(threshold),
            storage_gb,
            isDisabled: false,
        });

        return res.status(201).json(alert);
    } catch (error) {
        console.error('Create Price Alert error:', error);
        return res.status(500).json({ message: 'Failed to create price alert' });
    }
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

    await models.PriceAlert.destroy({ where: { id: alert.id } });

    return res.status(200).json({ message: 'Alert disabled successfully' });
});

// Get all price alerts
export const getAllPriceAlerts = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const alerts = await models.PriceAlert.findAll({
        where: { userId, isDisabled: false },
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
