import Joi from 'joi';

const storeSchema = {
    POST: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        website: Joi.string().uri().required(),
    }),
    PUT: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        website: Joi.string().uri().optional(),
    }),
};

export default storeSchema;
