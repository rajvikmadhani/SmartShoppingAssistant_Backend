import models from '../models/index.js';

export async function sendUserNotification(userId, productId, currentPrice) {
    try {
        const message = `Price dropped to €${currentPrice}`;

        const notification = await models.Notification.create({
            userId,
            productId,
            message,
            isRead: false,
        });

        console.log(`Notification stored: ${notification.id}`);
    } catch (error) {
        console.error('Failed to store notification:', error);
    }
}
