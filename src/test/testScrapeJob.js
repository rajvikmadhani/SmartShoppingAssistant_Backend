import { enqueueScrapingJob } from '../jobs/enqueue/enqueueScrapingJob.js';

const test = async () => {
    await enqueueScrapingJob(
        '0429792f-3bb5-4d51-be85-8d7926e3b016', // replace with real productId
        'https://www.amazon.de/dp/B0DXQHPY34', // real product_link
        {
            storage_gb: 128,
        }
    );

    console.log('Scraping job enqueued!');
};

test();
