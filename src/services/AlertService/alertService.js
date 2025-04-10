// File: services/alertService.js
import { getActiveAlertsForProduct } from '../../utils/alertRepo.js'; // assumed
import { enqueueNotificationJob } from '../../jobs/enqueue/enqueueNotificationJob.js';

export async function checkAlertsAndEnqueueNotifications(productId, priceData) {
    const { price, color, ram_gb, storage_gb } = priceData;

    const alerts = await getActiveAlertsForProduct(productId);

    for (const alert of alerts) {
        const matchesVariant =
            (!alert.color || alert.color === color) &&
            (!alert.ram_gb || alert.ram_gb === ram_gb) &&
            (!alert.storage_gb || alert.storage_gb === storage_gb);

        const matchesPrice = parseFloat(price) <= parseFloat(alert.threshold);

        if (matchesVariant && matchesPrice) {
            console.log(`Alert match: user ${alert.userId}, threshold €${alert.threshold}`);
            await enqueueNotificationJob(alert.userId, productId, price);
        }
    }
}
