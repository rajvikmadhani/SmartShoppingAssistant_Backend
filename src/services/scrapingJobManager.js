// Extracts ScrapingJob creation/updating
import models from '../../models/index.js';

export async function createScrapingJob(productId = null, storeId = null) {
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
