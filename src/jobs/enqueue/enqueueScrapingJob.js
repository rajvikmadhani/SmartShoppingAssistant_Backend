import { scrapingQueue } from '../queues/scrapingQueue.js';

export async function enqueueScrapingJob(productId, sourceUrl) {
    await scrapingQueue.add(
        'scrape-product',
        { productId, sourceUrl },
        {
            attempts: ,
            backoff: { type: 'exponential', delay: 3000 },
        }
    );
}
