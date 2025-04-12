import { Worker } from 'bullmq';
import { redisConnection } from '../../redis/index.js';
import { sendPriceAlertNotifications } from '../../services/AlertService/alertService.js';
console.log('👀 Worker started and waiting for jobs...');

const notificationWorker = new Worker(
    'notificationQueue',
    async (job) => {
        console.log('📬 Processing job:', job.data);
        await sendPriceAlertNotifications(job.data); // ✅ Uses correct function
    },
    {
        connection: redisConnection,
    }
);

console.log('✅ notificationWorker is up and listening for jobs...');
