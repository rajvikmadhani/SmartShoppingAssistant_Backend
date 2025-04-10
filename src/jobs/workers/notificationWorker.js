import { Worker } from 'bullmq';
import { redisConnection } from '../../redis/index.js';
import { sendUserNotification } from '../../services/notificationService.js';

const notificationWorker = new Worker(
    'notifications',
    async (job) => {
        const { userId, productId, currentPrice } = job.data;

        console.log(`Sending notification to user ${userId} for product ${productId} @ €${currentPrice}`);

        // Call your notification logic (email, DB insert, etc.)
        await sendUserNotification(userId, productId, currentPrice);
    },
    {
        connection: redisConnection,
    }
);

console.log('✅ notificationWorker is up and listening for jobs...');
