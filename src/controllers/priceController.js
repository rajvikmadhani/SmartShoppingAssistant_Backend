import Price from '../models/price.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// Get prices for a product
export const getPricesByProduct = asyncHandler(async (req, res, next) => {
    const prices = await Price.findAll({ where: { productId: req.params.productId } });
    if (!prices.length) {
        return next(new ErrorResponse('No prices found for this product', 404));
    }
    res.json(prices);
});

// Add or update price
export const upsertPrice = asyncHandler(async (req, res, next) => {
    const { productId, storeId, price, currency } = req.body;
    let priceRecord = await Price.findOne({ where: { productId, storeId } });
    if (priceRecord) {
        priceRecord.price = price;
        priceRecord.currency = currency;
        await priceRecord.save();
    } else {
        priceRecord = await Price.create({ productId, storeId, price, currency });
    }
    res.status(201).json(priceRecord);
});

// Delete a price record
export const deletePrice = asyncHandler(async (req, res, next) => {
    const priceRecord = await Price.findByPk(req.params.id);
    if (!priceRecord) {
        return next(new ErrorResponse('Price record not found', 404));
    }
    await priceRecord.destroy();
    res.json({ message: 'Price record deleted successfully' });
});
export const getAllPrices = asyncHandler(async (req, res, next) => {
    const prices = await Price.findAll();
    res.json(prices);
});
