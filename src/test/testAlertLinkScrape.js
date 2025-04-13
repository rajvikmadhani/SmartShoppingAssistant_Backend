import models from '../models/index.js';
import { scrapeProductPage } from '../services/scrapers/singleProductScraper.js';
import { updatePrices } from '../services/updateDatabase.js';
import { getProductWithPricesAndSeller } from '../utils/productRepo.js';
import { checkAlertsAndEnqueueNotifications } from '../services/alertService.js';

const runTest = async () => {
    try {
        // Step 1: Pick an alert
        const alert = await models.PriceAlert.findOne({
            include: [models.Product],
        });

        if (!alert) {
            console.log('❌ No alerts in DB.');
            return;
        }

        const product = await getProductWithPricesAndSeller({ id: alert.productId });

        const priceMatch = product?.Prices?.find(
            (p) =>
                (!alert.color || alert.color === p.color) &&
                (!alert.ram_gb || alert.ram_gb === p.ram_gb) &&
                (!alert.storage_gb || alert.storage_gb === p.storage_gb)
        );

        if (!priceMatch || !priceMatch.product_link) {
            console.log('⚠️ No valid price match or missing product_link.');
            return;
        }

        const store = priceMatch.SellerStore?.Seller?.name ?? 'Unknown';

        // Step 2: Scrape
        const scrapedData = await scrapeProductPage(priceMatch.product_link, store);
        console.log('✅ Scraped product data:', scrapedData);

        // Step 3: Update the price
        const updatedProduct = await updatePrices(product, [scrapedData]);
        console.log('✅ DB updated.');

        // Step 4: Check alerts
        await checkAlertsAndEnqueueNotifications(product.id, scrapedData);

        // Step 5: Confirm new notification
        const notifications = await models.Notification.findAll({
            where: { priceAlertId: alert.id },
            order: [['createdAt', 'DESC']],
        });

        if (notifications.length) {
            console.log(`🎉 Notification(s) created: ${notifications.length}`);
        } else {
            console.log('⚠️ No notification was created.');
        }
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

runTest();
