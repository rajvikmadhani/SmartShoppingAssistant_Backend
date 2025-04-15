//We are not using this. This is for future extension if we want a daily update automatically
import models from '../../models/index.js';
import { fetchProductData } from '../../services/fetchProductData.js';

async function runDailyFullProductScrape() {
    const products = await models.Product.findAll();
    console.log(`🌐 Starting full scrape of ${products.length} products...`);

    for (const product of products) {
        const productQuery = {
            name: product.name,
            brand: product.brand,
            region: 'DE',
        };

        try {
            await fetchProductData(productQuery, true); // manualTrigger = true
            console.log(`✅ Scraped and updated: ${product.name}`);
        } catch (err) {
            console.error(`❌ Failed to scrape ${product.name}: ${err.message}`);
        }
    }

    console.log('Full scrape complete.');
}

export default runDailyFullProductScrape;
