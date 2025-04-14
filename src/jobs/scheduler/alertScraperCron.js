// File: jobs/scheduler/alertScraperCron.js
import cron from 'node-cron';
import models from '../../models/index.js';
import { enqueueScrapingJob } from '../enqueue/enqueueScrapingJob.js';

async function enqueueJobsForActiveAlerts() {
    const alerts = await models.PriceAlert.findAll({
        where: { isDisabled: false },
        include: [{ model: models.Product }],
    });

    console.log(`🔁 Found ${alerts.length} active alerts`);

    for (const alert of alerts) {
        const product = alert.Product;
        if (!product) continue;

        const variant = {
            color: alert.color,
            ram_gb: alert.ram_gb,
            storage_gb: alert.storage_gb,
        };

        const matchingPrice = await models.Price.findOne({
            where: {
                productId: product.id,
                ...(alert.color && { color: alert.color }),
                ...(alert.ram_gb && { ram_gb: alert.ram_gb }),
                ...(alert.storage_gb && { storage_gb: alert.storage_gb }),
            },
            order: [['lastUpdated', 'DESC']],
        });

        if (!matchingPrice?.product_link) {
            console.warn(`⚠️ No product link for alert ${alert.id}`);
            continue;
        }

        await enqueueScrapingJob(product.id, matchingPrice.product_link, variant);
        console.log(`📦 Enqueued scraping for alert ${alert.id}`);
    }
}

// ⏰ Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Running scheduled alert scraper...');
    await enqueueJobsForActiveAlerts();
});
