// File: scripts/testScrapingJob.js
import { enqueueScrapingJob } from '../jobs/enqueue/enqueueScrapingJob.js';

const test = async () => {
    const testProductId = '5af5e4c9-492d-409e-93ea-62e553f52aa2';
    const testUrl = 'https://www.amazon.de/dp/B082WG57K6';

    await enqueueScrapingJob(testProductId, testUrl);

    console.log('🚀 Dummy job enqueued!');
};

test();
