// File: jobs/workers/scrapingWorker.js
import { Worker } from 'bullmq';
import { redisConnection } from '../../redis/index.js';
import { updateProductPrice } from '../../utils/productRepo.js'; // update logic
import { checkAlertsAndEnqueueNotifications } from '../../services/alertService/index.js'; // stub for now

const scrapingWorker = new Worker(
    'scraping',
    async (job) => {
        const { productId, sourceUrl } = job.data;

        console.log(`Scraping product [${productId}] from: ${sourceUrl}`);

        // Simulate scraping result (replace with real scraper)
        const scrapedPrice = await fakeScrape(sourceUrl);

        console.log(`Scraped price: €${scrapedPrice}`);

        // Update DB with new price
        await updateProductPrice(productId, scrapedPrice);

        // Optionally check alerts and queue notifications
        await checkAlertsAndEnqueueNotifications(productId, scrapedPrice);

        return { productId, scrapedPrice };
    },
    { connection: redisConnection }
);

// Simulated scrape (replace with actual logic later)
async function fakeScrape(url) {
    await new Promise((res) => setTimeout(res, 2000));
    return Math.floor(Math.random() * 400 + 100); // mock price
}
// File: jobs/workers/scrapingWorker.js
// ... (your existing code)

console.log('✅ scrapingWorker is up and waiting for jobs...');
