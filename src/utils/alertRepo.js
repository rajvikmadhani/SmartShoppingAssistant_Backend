import { Op } from 'sequelize';
import models from '../models/index.js';
export async function getActiveAlertsForProduct(productId, { color, ram_gb, storage_gb }) {
    return models.PriceAlert.findAll({
        where: {
            productId,
            [Op.and]: [
                {
                    [Op.or]: [{ color: null }, { color: color }],
                },
                {
                    [Op.or]: [{ ram_gb: null }, { ram_gb: ram_gb }],
                },
                {
                    [Op.or]: [{ storage_gb: null }, { storage_gb: storage_gb }],
                },
            ],
        },
    });
}
