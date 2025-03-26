import PriceAlert from '../models/priceAlert.js';

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
