import { Op } from 'sequelize';
import models from '../models/index.js';
import amazonScraper from '../scrapers/amazonScraper.js';
import ebayScraper from '../scrapers/ebayScraper.js';
import cron from 'node-cron';
import { fetchBestPrices } from './scraper/fetchBestPrices.js';
import { fetchProductData } from './scraper/fetchProductData.js';
import { updateDatabase } from './scraper/updateDatabase.js';
import { manageScrapingJob } from './scraper/scrapingJobManager.js';

class ScraperService {
    static async fetchBestPrices() {
        return fetchBestPrices();
    }

    static async fetchProductData(productQuery, manualTrigger = false) {
        return fetchProductData(productQuery, manualTrigger);
    }

    static async runScheduledScraping() {
        const outdatedProducts = await models.Price.findAll({
            where: {
                lastUpdated: {
                    [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            include: [models.Product],
        });

        for (const price of outdatedProducts) {
            const productQuery = {
                brand: price.Product.brand,
                name: price.Product.name,
                storage_gb: price.Product.storage_gb,
                ram_gb: price.Product.ram_gb,
                color: price.Product.color,
            };

            console.log(`Updating: ${productQuery.name} (${productQuery.brand})`);
            await fetchProductData(productQuery);
        }
    }
}

// Schedule the scraping job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled scraping task...');
    await ScraperService.runScheduledScraping();
});

export default ScraperService;
