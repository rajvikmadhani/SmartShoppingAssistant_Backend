// Extracts ScrapingJob creation/updating
import models from '../models/index.js';
import { Op } from 'sequelize';
export async function createScrapingJob(productId, store) {
    const { id } = await getStore(store);
    const storeId = id; // Assuming store is an object with id property
    return await models.ScrapingJob.create({
        productId,
        storeId,
        status: 'in_progress',
        startedAt: new Date(),
    });
}

export async function updateScrapingJob(job, status, errorMessage = null) {
    return await job.update({
        status,
        errorMessage,
        completedAt: new Date(),
    });
}
const getStore = async (store) => {
    const storeData = await models.Store.findOne({
        where: {
            name: {
                [Op.iLike]: `%${store.toLowerCase()}%`, // Case-insensitive search
            },
        },
    });

    console.log('Store Data:', storeData);
    return storeData;
};
