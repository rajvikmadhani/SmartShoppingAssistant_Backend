import { Op } from 'sequelize';
import models from '../models/index.js';
import { fetchProductData } from './fetchProductData.js'; // Fixed path
import { fetchBestPrices } from './fetchBestPrices.js'; // Added import

class ScraperService {
    static async fetchBestPrices() {
        return fetchBestPrices();
    }

    static async fetchProductData(productQuery, manualTrigger = false) {
        // This now directly calls the fetchProductData module
        return fetchProductData(productQuery, manualTrigger);
    }

    static async runScheduledScraping() {
        const outdatedProducts = await models.Price.findAll({
            where: {
                lastUpdated: {
                    [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000), // check if older than 24 hours
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
            await fetchProductData(productQuery); // Now directly calling fetchProductData
        }
    }
}

export default ScraperService;
