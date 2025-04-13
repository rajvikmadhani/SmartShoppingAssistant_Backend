// File: services/alertService.js
import { getActiveAlertsForProduct } from '../../utils/alertRepo.js'; // assumed
import { enqueueNotificationJob } from '../../jobs/enqueue/enqueueNotificationJob.js';
import models from '../../models/index.js';

export async function checkAlertsAndEnqueueNotifications(productId, priceData) {
    const { price, color, ram_gb, storage_gb } = priceData;
    const alerts = await getActiveAlertsForProduct(productId, { color, ram_gb, storage_gb });

    for (const alert of alerts) {
        const matchesPrice = parseFloat(price) <= parseFloat(alert.threshold);
        if (matchesPrice) {
            console.log(`✅ Alert match for alert ID ${alert.id}, threshold €${alert.threshold}`);
            await enqueueNotificationJob(alert.id, price);
        }
    }
}

/**
 * Create a new Notification entry when an alert is triggered.
 * Called by notificationWorker.
 */
// services/alertService.js

export async function sendPriceAlertNotifications({ priceAlertId, price }) {
    try {
        const alert = await models.PriceAlert.findByPk(priceAlertId, {
            include: [{ model: models.Product }, { model: models.User }],
        });

        if (!alert) {
            console.warn(`⚠️ No PriceAlert found with ID ${priceAlertId}`);
            return;
        }

        const notification = await models.Notification.create({
            priceAlertId,
            price: parseFloat(price),
            isRead: false,
        });

        // Send email to the user
        await sendPriceDropEmail({
            to: alert.User.email,
            productName: alert.Product.name,
            threshold: alert.threshold,
            currentPrice: price,
        });
        console.log(`🔔 Notification created: ${notification.id} for alert ${priceAlertId}`);
    } catch (error) {
        console.error('❌ Failed to create notification:', error);
    }
}
