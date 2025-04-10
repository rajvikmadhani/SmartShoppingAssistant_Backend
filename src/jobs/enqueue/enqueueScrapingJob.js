import { scrapingQueue } from '../queues/scrapingQueue.js';

export async function enqueueScrapingJob(productId, sourceUrl) {
    await scrapingQueue.add(
        'scrape-product',
        { productId, sourceUrl },
        {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
        }
    );
}
