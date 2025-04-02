// Handles product-specific search & scraping

import { createScrapingJob, updateScrapingJob } from './scrapingJobManager.js';
import amazonScraper from '../scrapers/amazonScraper.js';
import ebayScraper from '../scrapers/ebayScraper.js';
import updateDatabase from './updateDatabase.js'; // Changed path
import models from '../models/index.js'; // Added import

export const fetchProductData = async (productQuery, manualTrigger = false) => {
    const { brand, name, storage_gb, ram_gb, color, region } = productQuery;

    // Determine the correct Amazon domain
    const amazonDomain = region === 'DE' ? 'amazon.de' : 'amazon.com';

    // Check if the product exists in the DB
    let product = await models.Product.findOne({
        where: { brand, name, storage_gb, ram_gb, color },
        include: [{ model: models.Price }],
    });

    let shouldScrape = manualTrigger; // Force scrape if triggered manually
    if (!product) {
        shouldScrape = true;
    } else {
        const latestPrice = await models.Price.findOne({
            where: { productId: product.id },
            order: [['lastUpdated', 'DESC']],
        });

        if (!latestPrice || new Date() - latestPrice.lastUpdated > 24 * 60 * 60 * 1000) {
            shouldScrape = true;
        }
    }

    if (shouldScrape) {
        // Create scraping job entry
        const scrapingJob = await createScrapingJob(product?.id);

        try {
            console.log(`Fetching data from Amazon (${amazonDomain}) and eBay for: ${name} ${brand}`);

            const [amazonResults, ebayResults] = await Promise.all([
                amazonScraper(productQuery, amazonDomain), // Pass the region to amazonScraper
                ebayScraper(productQuery),
            ]);

            const updatedProduct = await updateDatabase(product, amazonResults.concat(ebayResults));

            await updateScrapingJob(scrapingJob, 'completed');

            return updatedProduct;
        } catch (error) {
            await updateScrapingJob(scrapingJob, 'failed', error.message);
            throw error;
        }
    }

    return product;
};
