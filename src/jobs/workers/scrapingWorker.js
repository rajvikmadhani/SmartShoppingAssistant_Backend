import { Worker } from 'bullmq';
import { redisConnection } from '../../redis';

const scrapingWorker = new Worker(
    'scraping',
    async (job) => {
        // TODO: implement actual scraping logic
        console.log('Processing job:', job.name, job.data);
    },
    {
        connection: redisConnection,
    }
);
