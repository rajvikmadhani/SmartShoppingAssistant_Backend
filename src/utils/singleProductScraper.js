import { scrapeAmazonProduct } from '../services/scrapers/amazonProductScraper.js';
import { scrapeEbayProduct } from '../services/scrapers/ebayProductScraper.js';

export async function scrapeProductPage(productLink, store) {
    if (!productLink || !store) {
        throw new Error('Missing productLink or store');
    }

    if (store.toLowerCase().includes('amazon')) {
        return await scrapeAmazonProduct(productLink);
    }

    if (store.toLowerCase().includes('ebay')) {
        return await scrapeEbayProduct(productLink);
    }

    throw new Error(`Store "${store}" not supported`);
}
