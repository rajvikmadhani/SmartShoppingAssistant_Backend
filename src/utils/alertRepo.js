import { Op } from 'sequelize';
import models from '../models/index.js';
export async function getActiveAlertsForProduct(productId, { color, ram_gb, storage_gb }) {
    const where = {
        productId,
        [Op.and]: [],
    };

    if (color !== undefined) {
        where[Op.and].push({
            [Op.or]: [{ color: null }, { color }],
        });
    }

    if (ram_gb !== undefined) {
        where[Op.and].push({
            [Op.or]: [{ ram_gb: null }, { ram_gb }],
        });
    }

    if (storage_gb !== undefined) {
        where[Op.and].push({
            [Op.or]: [{ storage_gb: null }, { storage_gb }],
        });
    }

    const result = await models.PriceAlert.findAll({ where });
    console.log('✅ Alerts found:', result.length);
    return result;
}
