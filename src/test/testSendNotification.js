import { sendPriceAlertNotifications } from '../services/AlertService/alertService.js';
import models from '../models/index.js';
import { sequelize } from '../db/index.js';

(async () => {
    try {
        // 🧪 Replace with a real PriceAlert ID from your DB
        const fakeAlertId = '75d4b6ab-41ee-49bb-8c3e-fee0abbca039';
        const testPrice = '450'; // or any value that would trigger the alert

        // Test DB connection first (optional)
        await sequelize.authenticate();
        console.log('✅ DB connected successfully.');

        await sendPriceAlertNotifications({
            priceAlertId: fakeAlertId,
            price: testPrice,
        });

        console.log('✅ sendPriceAlertNotifications finished.');
    } catch (err) {
        console.error('❌ Error testing notification flow:', err);
    } finally {
        await sequelize.close();
    }
})();
