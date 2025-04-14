import { scrapeAmazonProduct } from './scrapAmazonProduct.js';
import { scrapeEbayProduct } from './scrapEbayProduct.js';
export async function scrapeProductPage(link, storeName) {
    if (storeName.toLowerCase().includes('amazon')) {
        return await scrapeAmazonProduct(link);
    }

    if (storeName.toLowerCase().includes('ebay')) {
        return await scrapeEbayProduct(link);
    }
}
