// File: services/alertService.js
import { getActiveAlertsForProduct } from '../../utils/alertRepo.js'; // assumed
import { enqueueNotificationJob } from '../../jobs/enqueue/enqueueNotificationJob.js';
import { sendPriceDropEmail } from '../emailService.js';
import { getProductWithPricesAndSeller } from '../../utils/productRepo.js';
import models from '../../models/index.js';

export async function checkAlertsAndEnqueueNotifications(productId, priceData) {
    const { price, color, ram_gb, storage_gb } = priceData;
    const alerts = await getActiveAlertsForProduct(productId, { color, ram_gb, storage_gb });

    for (const alert of alerts) {
        const matchesPrice = parseFloat(price) <= parseFloat(alert.threshold);
        if (matchesPrice) {
            console.log(`Alert match for alert ID ${alert.id}, threshold €${alert.threshold}`);
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
            include: [{ model: models.User }],
        });

        if (!alert) {
            console.warn(`PriceAlert not found: ${priceAlertId}`);
            return;
        }

        // Get full product with prices + seller info
        const product = await getProductWithPricesAndSeller({ id: alert.productId });

        // Match the correct variant (color, ram, storage)
        const priceMatch = product?.Prices?.find(
            (p) =>
                (!alert.color || alert.color === p.color) &&
                (!alert.ram_gb || alert.ram_gb === p.ram_gb) &&
                (!alert.storage_gb || alert.storage_gb === p.storage_gb)
        );

        if (!priceMatch) {
            console.warn('No matching price variant found for alert:', alert.id);
            return;
        }

        // Save the notification
        const notification = await models.Notification.create({
            priceAlertId,
            price: parseFloat(price),
            isRead: false,
        });
        console.log('📷 Email image URL:', priceMatch.mainImgUrl);

        // Send the email
        await sendPriceDropEmail({
            to: alert.User.email,
            productName: product.name,
            productImage: priceMatch.mainImgUrl,
            threshold: alert.threshold,
            currentPrice: priceMatch.price + priceMatch.currency,
            storeName: priceMatch.SellerStore?.Seller?.name ?? 'Unknown',
            productLink: priceMatch.product_link,
            discount: priceMatch.discount,
            shippingCost: priceMatch.shippingCost,
        });

        console.log(`Notification created and email sent for alert ${alert.id}`);
    } catch (err) {
        console.error('Failed to send price alert notification:', err);
    }
}
