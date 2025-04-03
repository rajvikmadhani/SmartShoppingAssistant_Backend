// Handles product-specific search & scraping

import { createScrapingJob, updateScrapingJob } from './scrapingJobManager.js';
import { amazonScraper, ebayScraper } from './scrapers/index.js';
import updateDatabase from './updateDatabase.js'; // Changed path
import models from '../models/index.js'; // Added import
export const fetchProductData = async (productQuery, manualTrigger = false) => {
    const { brand, name, storage_gb, ram_gb, color, region = 'DE' } = productQuery;

    // Determine the correct Amazon domain
    const domain = region === 'DE' ? 'de' : 'com';
    //filter the null valuse
    let whereClause = {};
    if (brand) whereClause.brand = brand;
    if (name) whereClause.name = name;
    if (storage_gb) whereClause.storage_gb = storage_gb;
    if (ram_gb) whereClause.ram_gb = ram_gb;
    if (color) whereClause.color = color;

    // Check if the product exists in the DB
    let product = await models.Product.findOne({
        where: whereClause,
        include: [{ model: models.Price }],
    });
    console.log('Product:', product);
    let shouldScrape = manualTrigger; // Force scrape if triggered manually
    if (!product) {
        product = await CreatePrimaryProduct(name, brand);
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
        // Create scraping job entries for Amazon and eBay
        const amazonScrapingJob = await createScrapingJob(product.id, `amazon.${domain}`);
        const ebayScrapingJob = await createScrapingJob(product.id, `ebay.${domain}`);

        console.log('Scraping jobs created for stores:', amazonScrapingJob.storeId, ebayScrapingJob.storeId);

        let amazonResults = [];
        let ebayResults = [];

        // Try scraping from Amazon
        try {
            console.log(`Fetching data from Amazon (${domain}) for: ${name} ${brand}`);
            amazonResults = await amazonScraper(whereClause, domain);
            amazonResults = amazonResults.map((result) => ({
                ...result,
                storeId: amazonScrapingJob.storeId, // Assuming Amazon has storeId 1
            }));
            await updateScrapingJob(amazonScrapingJob, 'completed');
        } catch (error) {
            console.error(`Amazon scraping failed: ${error.message}`);
            await updateScrapingJob(amazonScrapingJob, 'failed', error.message);
        }

        // Try scraping from eBay
        try {
            console.log(`Fetching data from eBay (${domain}) for: ${name} ${brand}`);
            ebayResults = await ebayScraper(whereClause, domain);
            ebayResults = ebayResults.map((result) => ({
                ...result,
                storeId: ebayScrapingJob.storeId, // Assuming eBay has storeId 2
            }));

            await updateScrapingJob(ebayScrapingJob, 'completed');
        } catch (error) {
            console.error(`eBay scraping failed: ${error.message}`);
            await updateScrapingJob(ebayScrapingJob, 'failed', error.message);
        }

        // Combine results and update the database if any data was fetched
        const allResults = [...amazonResults, ...ebayResults];

        if (allResults.length > 0) {
            const updatedProduct = await updateDatabase(product, allResults);
            console.log('Scraping completed and database updated.');
            return updatedProduct;
        } else {
            console.log('Both scrapers failed. No data updated.');
            return product; // Return the existing product without updates
        }
    }

    return product;
};
const CreatePrimaryProduct = async (name, brand) => {
    const product = await models.Product.create({
        brand: brand,
        name: name,
        storage_gb: 0,
        ram_gb: 0,
        color: 'No color',
    });
    console.log('New product created:', product);
    return product;
};
