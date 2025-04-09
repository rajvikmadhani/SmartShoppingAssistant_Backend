// controllers/priceHistoryController.js
import models from '../models/index.js';
import { Op } from 'sequelize';
const { Price, PriceHistory, SellerStore } = models;

export const getPriceHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { ram = '0', storage, color } = req.query;

        if (!storage) {
            return res.status(400).json({ error: 'storage are required.' });
        }

        // Step 1: Find matching priceIds for this variant
        const priceEntries = await Price.findAll({
            where: {
                productId,
                ram_gb: Number(ram),
                storage_gb: Number(storage),
                ...(color ? { color } : {}),
            },
        });

        if (!priceEntries.length) {
            return res.status(404).json({ message: 'No matching variant found.' });
        }

        const priceIds = priceEntries.map((entry) => entry.id);

        // Step 2: Get history for all those priceIds (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const history = await PriceHistory.findAll({
            where: {
                priceId: {
                    [Op.in]: priceIds,
                },
                recordedAt: {
                    [Op.gte]: sixMonthsAgo,
                },
            },
            include: {
                model: Price,
                include: [{ model: SellerStore, include: ['Store', 'Seller'] }],
            },
            order: [['recordedAt', 'ASC']],
        });

        // Step 3: Format response
        const formatted = history.map((entry) => ({
            price: parseFloat(entry.price),
            currency: entry.currency,
            availability: entry.availability,
            date: entry.recordedAt,
            seller: entry.Price?.SellerStore?.Seller?.name,
            store: entry.Price?.SellerStore?.Store?.name,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
// controllers/priceHistoryController.js
export const getChartData = async (req, res) => {
    try {
        const { productId } = req.params;
        const { ram = '0', storage, color } = req.query;

        if (!storage) {
            return res.status(400).json({ error: 'storage are required.' });
        }

        // Step 1: Find all price rows for this variant
        const priceEntries = await Price.findAll({
            where: {
                productId,
                ram_gb: Number(ram),
                storage_gb: Number(storage),
                ...(color ? { color } : {}),
            },
        });

        if (!priceEntries.length) {
            return res.status(404).json({ message: 'No matching variant found.' });
        }

        const priceIds = priceEntries.map((entry) => entry.id);

        // Step 2: Query history from the past 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const priceHistories = await PriceHistory.findAll({
            where: {
                priceId: { [Op.in]: priceIds },
                recordedAt: { [Op.gte]: sixMonthsAgo },
            },
            order: [['recordedAt', 'ASC']],
        });

        // Step 3: Format as label/value pairs
        const formatted = priceHistories.map((entry) => ({
            label: entry.recordedAt.toISOString().split('T')[0], // e.g., '2025-04-09'
            value: parseFloat(entry.price),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
