import Joi from 'joi';

const productSchema = {
    POST: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().min(10).max(1000).required(),
        storeId: Joi.number().integer().required(),
    }),
    PUT: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().min(10).max(1000).optional(),
        storeId: Joi.number().integer().optional(),
    }),
};

export default productSchema;
