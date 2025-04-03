import asyncHandler from '../utils/asyncHandler.js';
import ScraperService from '../services/scraperService.js';

export const scrapeProduct = asyncHandler(async (req, res, next) => {
    const productQuery = req.query;
    if (!productQuery.name || !productQuery.brand) {
        return res
            .status(400)
            .json({ error: 'Missing required name and brand attributes. e.g, products?name=iPhone&brand=Apple 13' });
    }

    const product = await ScraperService.fetchProductData(productQuery);
    res.json(product);
});
