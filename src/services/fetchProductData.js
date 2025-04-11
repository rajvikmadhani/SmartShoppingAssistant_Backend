// Handles product-specific search & scraping

import { createScrapingJob, updateScrapingJob } from './scrapingJobManager.js';
import { amazonScraper, ebayScraper, filterScrapperResults } from './scrapers/index.js';
import { updatePrices, updateProducts } from './updateDatabase.js'; // Changed path
import models from '../models/index.js'; // Added import
import { CreatePrimaryProduct, getProductWithPricesAndSeller } from '../utils/productRepo.js';
import { isRealSmartphone } from './filters/smartphoneFilter.js';
import { getInsensitiveMatch } from '../utils/textHelper.js';
export const fetchProductData = async (productQuery, manualTrigger = false) => {
    const { name, brand, storage_gb, ram_gb, color, region = 'DE' } = productQuery;
    console.log('productQuery:', productQuery);
    // Determine the correct Amazon domain
    const domain = region === 'DE' ? 'de' : 'com';
    //filter the null valuse
    let filter = {};
    if (brand) filter.brand = brand;
    if (storage_gb) filter.storage_gb = storage_gb;
    if (ram_gb) filter.ram_gb = ram_gb;
    if (color) filter.color = color;

    let scrappedDataFilter = { ...filter, title: name };
    let productfilter = getInsensitiveMatch(name, filter);
    console.log('scrappedDataFilter:', scrappedDataFilter);
    // Check if the product exists in the DB
    let product = await getProductWithPricesAndSeller(productfilter);
    let newProduct = false; // Flag to indicate if a new product was created
    console.log('Product:', product);
    let shouldScrape = manualTrigger; // Force scrape if triggered manually
    if (!product) {
        product = await CreatePrimaryProduct(name, 'Unknown');
        newProduct = true; // Set the flag to true if a new product was created
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

        let scraperQuery = [name, brand, storage_gb ? `${storage_gb}GB` : '', ram_gb ? `${ram_gb}GB` : '', color]
            .filter(Boolean) // removes falsy values like '', null, undefined
            .join(' ') // joins them with a single space
            .trim(); // trims leading/trailing whitespace

        let amazonResults = await ScrapFromAmazon(domain, name, brand, scraperQuery, amazonScrapingJob);
        let ebayResults = await ScrapFromEbay(domain, name, brand, scraperQuery, ebayScrapingJob);

        // Combine results and update the database if any data was fetched
        const amazonArray = Array.isArray(amazonResults) ? amazonResults : Array.from(amazonResults || []);
        const ebayArray = Array.isArray(ebayResults) ? ebayResults : Array.from(ebayResults || []);
        let allResults = [...amazonArray, ...ebayArray];
        allResults = allResults.filter((prod) => isRealSmartphone(prod));
        console.log('The length of the scraped and filter and clean Data:', allResults.length);

        if (allResults.length > 0) {
            if (newProduct) {
                updateProducts(product.id, allResults);
            }
            const updatedProduct = await updatePrices(product, filterScrapperResults(allResults, scrappedDataFilter));
            //console.log('Scraping completed and database updated.');
            return updatedProduct;
        } else {
            console.log('Both scrapers failed. No data updated.');
            return product; // Return the existing product without updates
        }
    }

    return product;
};
const ScrapFromAmazon = async (domain, name, brand, scraperQuery, amazonScrapingJob) => {
    let amazonResults = [];
    try {
        console.log(`Fetching data from Amazon (${domain}) for: ${name} ${brand}`);
        amazonResults = await amazonScraper(scraperQuery, domain);
        amazonResults = amazonResults.map((result) => ({
            ...result,
            storeId: amazonScrapingJob.storeId, // Assuming Amazon has storeId 1
        }));
        await updateScrapingJob(amazonScrapingJob, 'completed');
    } catch (error) {
        console.error(`Amazon scraping failed: ${error.message}`);
        await updateScrapingJob(amazonScrapingJob, 'failed', error.message);
    }
    return amazonResults;
};
const ScrapFromEbay = async (domain, name, brand, scraperQuery, ebayScrapingJob) => {
    let ebayResults = [];
    try {
        console.log(`Fetching data from eBay (${domain}) for: ${name} ${brand}`);
        ebayResults = await ebayScraper(scraperQuery, domain);
        ebayResults = ebayResults.map((result) => ({
            ...result,
            storeId: ebayScrapingJob.storeId, // Assuming eBay has storeId 2
        }));

        await updateScrapingJob(ebayScrapingJob, 'completed');
    } catch (error) {
        console.error(`eBay scraping failed: ${error.message}`);
        await updateScrapingJob(ebayScrapingJob, 'failed', error.message);
    }
    return ebayResults;
};
