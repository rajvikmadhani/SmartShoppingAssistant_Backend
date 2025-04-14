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
        // 1. Skip disabled alerts
        if (alert.isDisabled) continue;

        // 2. Rate-limit: skip if already notified in last 24h
        if (alert.lastNotifiedAt && Date.now() - new Date(alert.lastNotifiedAt).getTime() < 24 * 60 * 60 * 1000) {
            continue;
        }
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

        const product = await getProductWithPricesAndSeller({ id: alert.productId });

        // Match all variants that satisfy the alert
        const priceMatches = product?.Prices?.filter(
            (p) =>
                (!alert.color || alert.color === p.color) &&
                (!alert.ram_gb || alert.ram_gb === p.ram_gb) &&
                (!alert.storage_gb || alert.storage_gb === p.storage_gb)
        );

        if (!priceMatches?.length) {
            console.warn(`No matching price variants found for alert ${alert.id}`);
            return;
        }

        // Choose the one with the lowest price
        const priceMatch = priceMatches.reduce((lowest, current) => {
            return parseFloat(current.price) < parseFloat(lowest.price) ? current : lowest;
        }, priceMatches[0]);

        // Prevent duplicate notification
        const existing = await models.Notification.findOne({
            where: {
                priceAlertId,
                price: parseFloat(price),
            },
        });

        if (existing) {
            console.log(`Duplicate notification already exists for alert ${priceAlertId} at €${price}`);
            return;
        }

        // Save the notification
        const notification = await models.Notification.create({
            priceAlertId,
            price: parseFloat(price),
            isRead: false,
        });

        console.log('Email image URL:', priceMatch.mainImgUrl);

        await sendPriceDropEmail({
            to: alert.User.email,
            productName: product.name,
            productImage: priceMatch.mainImgUrl,
            threshold: alert.threshold,
            currentPrice: parseFloat(priceMatch.price).toFixed(2),
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
