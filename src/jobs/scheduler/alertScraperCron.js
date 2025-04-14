import cron from 'node-cron';
import models from '../../models/index.js';
import { scrapeProductPage } from '../../services/scrapers/singleProductScraper.js';
import { updatePrices } from '../../services/updateDatabase.js';
import { getProductWithPricesAndSeller } from '../../utils/productRepo.js';
import { checkAlertsAndEnqueueNotifications } from '../../services/AlertService/alertService.js';
console.log('⏰ Alert-driven scraping scheduler is live...');

// Run every hour (change schedule if needed)
cron.schedule('0 * * * *', async () => {
    console.log('🔁 Running alert-based scraping cycle...');

    try {
        const alerts = await models.PriceAlert.findAll({
            include: [models.Product],
        });

        const seenVariants = new Set();

        for (const alert of alerts) {
            const key = `${alert.productId}_${alert.color}_${alert.ram_gb}_${alert.storage_gb}`;
            if (seenVariants.has(key)) continue;
            seenVariants.add(key);

            const product = await getProductWithPricesAndSeller({ id: alert.productId });

            const priceMatch = product?.Prices?.find(
                (p) =>
                    (!alert.color || alert.color === p.color) &&
                    (!alert.ram_gb || alert.ram_gb === p.ram_gb) &&
                    (!alert.storage_gb || alert.storage_gb === p.storage_gb)
            );

            if (!priceMatch || !priceMatch.product_link) {
                console.warn(`⚠️ No matching price found or no product_link for alert ${alert.id}`);
                continue;
            }

            const storeName = priceMatch.SellerStore?.Store?.name ?? 'unknown';
            const scrapedData = await scrapeProductPage(priceMatch.product_link, storeName);
            await checkAlertsAndEnqueueNotifications(product.id, scrapedData);

            if (scrapedData) {
                console.log(`🔄 Updating price for ${alert.Product.name}`);
                await updatePrices(product, [scrapedData]);
            }
        }

        console.log('Alert-based scraping run complete.');
    } catch (err) {
        console.error('Error during alert scraping job:', err);
    }
});
