import asyncHandler from '../utils/asyncHandler.js';
import ScraperService from '../services/scraperService.js';
import { enqueueScrapingJob } from '../jobs/enqueue/enqueueScrapingJob.js';
import { getProductById } from '../utils/productRepo.js'; // assuming this exists

export async function refreshProductPrice(req, res) {
    const { id } = req.params;

    // Get product from DB (or however you're storing source URLs)
    const product = await getProductById(id);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    // Enqueue a background scraping job
    await enqueueScrapingJob(product.id, product.sourceUrl);

    return res.status(202).json({ message: 'Scraping job enqueued.' });
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
