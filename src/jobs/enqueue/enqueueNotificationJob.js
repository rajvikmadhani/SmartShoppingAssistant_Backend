// File: jobs/enqueue/enqueueNotificationJob.js
import { notificationQueue } from '../queues/notificationQueue.js';

export async function enqueueNotificationJob(userId, productId, currentPrice) {
    await notificationQueue.add(
        'send-notification',
        { userId, productId, currentPrice },
        {
            attempts: 2,
            backoff: { type: 'fixed', delay: 2000 },
        }
    );
}
