// jobs/enqueue/enqueueNotificationJob.js
import { notificationQueue } from '../queues/notificationQueue.js';

export async function enqueueNotificationJob(priceAlertId, price) {
    await notificationQueue.add(
        'sendNotification',
        { priceAlertId, price },
        {
            attempts: 3,
            backoff: 5000,
        }
    );
}
