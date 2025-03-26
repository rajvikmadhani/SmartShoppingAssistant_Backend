import Joi from 'joi';

const scrapingJobSchema = {
    POST: Joi.object({
        storeId: Joi.number().integer().required(),
        status: Joi.string().valid('pending', 'in_progress', 'completed', 'failed').required(),
        startedAt: Joi.date().iso().optional(),
        completedAt: Joi.date().iso().optional(),
    }),
};

export default scrapingJobSchema;
