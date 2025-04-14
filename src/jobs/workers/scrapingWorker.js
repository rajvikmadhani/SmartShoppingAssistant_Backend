import { Worker } from 'bullmq';
import { redisConnection } from '../../redis/index.js';
import { scrapeProductPage } from '../../services/scrapers/singleProductScraper.js';
import { getProductWithPricesAndSeller } from '../../utils/productRepo.js';
import { checkAlertsAndEnqueueNotifications } from '../../services/AlertService/alertService.js';
import { updateScrapedProductDetails } from '../../services/updateScrapedProductDetails.js';
import store from '../../models/store.js';

const scrapingWorker = new Worker(
    'scraping',
    async (job) => {
        const { productId, sourceUrl, color, ram_gb, storage_gb } = job.data;

        console.log(`🔍 Scraping product [${productId}] from: ${sourceUrl}`);

        const product = await getProductWithPricesAndSeller({ id: productId });

        const variant = product?.Prices?.find(
            (p) =>
                (!color || color === p.color) &&
                (!ram_gb || ram_gb === p.ram_gb) &&
                (!storage_gb || storage_gb === p.storage_gb)
        );

        const storeName = variant.SellerStore?.Store?.name ?? 'unknown';

        console.log('streName:', storeName);
        const scrapedData = await scrapeProductPage(sourceUrl, storeName);
        console.log('📦 Scraped data:', scrapedData);

        if (!scrapedData || !scrapedData.price) {
            console.warn(`⚠️ Scraper failed or price missing for ${sourceUrl}`);
            return;
        }
        console.log('Updating/inserting scraped data...');

        // Always attempt update or insert
        await updateScrapedProductDetails(product, scrapedData);

        // Only trigger alerts if this variant already existed in DB
        if (variant) {
            await checkAlertsAndEnqueueNotifications(productId, scrapedData);
        }

        console.log(`✅ Scraping job complete for product ${productId}`);
        return { productId, updated: true };
    },
    { connection: redisConnection }
);

console.log('✅ scrapingWorker is up and listening for jobs...');
