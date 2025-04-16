import { Op } from 'sequelize';
import models from '../models/index.js';

export async function getActiveAlertsForProduct(productId, { color, ram_gb, storage_gb }) {
    const andConditions = [];
    console.log('imputs', { productId, color, ram_gb, storage_gb });
    if (color !== undefined) {
        andConditions.push({
            [Op.or]: [{ color: null }, { color }],
        });
    }

    if (ram_gb !== undefined) {
        andConditions.push({
            [Op.or]: [{ ram_gb: null }, { ram_gb }],
        });
    }

    if (storage_gb !== undefined) {
        andConditions.push({
            [Op.or]: [{ storage_gb: null }, { storage_gb }],
        });
    }

    const where = {
        productId,
        isDisabled: false,
        ...(andConditions.length > 0 && { [Op.and]: andConditions }),
    };
    console.log('where:', where);
    const result = await models.PriceAlert.findAll({ where });
    console.log('✅ Alerts found:', result.length);
    return result;
}
