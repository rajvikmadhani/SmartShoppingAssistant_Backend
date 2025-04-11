import asyncHandler from '../utils/asyncHandler.js';
import ScraperService from '../services/scraperService.js';
import { enqueueScrapingJob } from '../jobs/enqueue/enqueueScrapingJob.js';
import { getProductWithPricesAndSeller } from '../utils/productRepo.js'; // assuming this exists

export async function refreshProductPrice(req, res) {
    const { id } = req.params;

    const product = await getProductWithPricesAndSeller({ id });
    if (!product || !product.Prices || product.Prices.length === 0) {
        return res.status(404).json({ message: 'Product or its price variants not found.' });
    }

    const alerts = await getActiveAlertsForProduct(product.id);

    let jobsEnqueued = 0;

    for (const price of product.Prices) {
        const matchesAnyAlert = alerts.some(
            (alert) =>
                (!alert.color || alert.color === price.color) &&
                (!alert.ram_gb || alert.ram_gb === price.ram_gb) &&
                (!alert.storage_gb || alert.storage_gb === price.storage_gb)
        );

        if (matchesAnyAlert) {
            await enqueueScrapingJob(product.id, price.product_link, {
                color: price.color,
                ram_gb: price.ram_gb,
                storage_gb: price.storage_gb,
            });
            jobsEnqueued++;
        }
    }

    if (jobsEnqueued === 0) {
        return res.status(204).json({ message: 'No alerts matched any variants. Nothing enqueued.' });
    }

    return res.status(202).json({ message: `${jobsEnqueued} scraping jobs enqueued for matching variants.` });
}

export const scrapeProduct = asyncHandler(async (req, res, next) => {
    const productQuery = req.query;
    // if (!productQuery.name || !productQuery.brand) {
    //     return res
    //         .status(400)
    //         .json({ error: 'Missing required name and brand attributes. e.g, products?name=iPhone 13&brand=Apple' });
    // }

    const product = await ScraperService.fetchProductData(productQuery);
    res.json(product);
});
