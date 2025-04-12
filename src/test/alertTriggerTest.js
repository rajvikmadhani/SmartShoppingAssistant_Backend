// test/alertTriggerTest.js
import models from '../models/index.js';
import { checkAlertsAndEnqueueNotifications } from '../services/AlertService/alertService.js';

const runTest = async () => {
    try {
        // Step 1: Pick a real product from your DB
        const product = await models.Product.findOne({ include: models.Price });
        if (!product || product.Prices.length === 0) {
            console.error('❌ No product or price variants found in DB.');
            return;
        }

        const variant = product.Prices[0]; // Use first variant
        console.log('✅ Using product:', product.name);

        // Step 2: Create a price alert
        const alert = await models.PriceAlert.create({
            userId: '82bd3207-3d6b-40b9-9a3c-fe0f2aa6bb1b', // Change if needed
            productId: product.id,
            threshold: parseFloat(variant.price) + 10, // Will trigger notification
            color: variant.color,
            ram_gb: variant.ram_gb,
            storage_gb: variant.storage_gb,
        });

        console.log('✅ PriceAlert created:', alert.id);

        // Step 3: Manually trigger alert check (simulates what updatePrices does)
        await checkAlertsAndEnqueueNotifications(product.id, {
            price: variant.price,
            color: variant.color,
            ram_gb: variant.ram_gb,
            storage_gb: variant.storage_gb,
        });

        console.log('📨 Notification job enqueued — waiting 3s for worker to process...');

        // Wait for the worker to pick it up
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Step 4: Check if a notification was created
        const notifications = await models.Notification.findAll({
            where: { priceAlertId: alert.id },
            include: [{ model: models.PriceAlert }],
            order: [['createdAt', 'DESC']],
        });

        if (notifications.length > 0) {
            console.log(
                '✅ Notification created:',
                notifications[0].PriceAlert.userId,
                notifications[0].PriceAlert.productId,
                notifications[0].price
            );
        } else {
            console.warn('⚠️ No notification found.');
        }

        console.log('✅ Test completed.');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

runTest();
