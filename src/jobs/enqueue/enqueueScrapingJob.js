// File: jobs/enqueue/enqueueScrapingJob.js
import { scrapingQueue } from '../queues/scrapingQueue.js';

export async function enqueueScrapingJob(productId, sourceUrl, variant = {}) {
    const { color, ram_gb, storage_gb } = variant;

    await scrapingQueue.add(
        'scrape-product',
        {
            productId,
            sourceUrl,
            color,
            ram_gb,
            storage_gb,
        },
        {
            attempts: 1,
            backoff: { type: 'exponential', delay: 3000 },
        }
    );
}
