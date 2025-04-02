import Joi from 'joi';

const productSchema = {
    POST: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().min(10).max(1000).optional(),
        brand: Joi.string().min(1).max(255).required(),
        ram_gb: Joi.number().integer().min(1).required(),
        storage_gb: Joi.number().integer().min(1).required(),
        color: Joi.string().min(1).max(50).required(),
        mainImgUrl: Joi.string().uri().optional(),
    }),
    PUT: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().min(10).max(1000).optional(),
        brand: Joi.string().min(1).max(255).optional(),
        ram_gb: Joi.number().integer().min(1).optional(),
        storage_gb: Joi.number().integer().min(1).optional(),
        color: Joi.string().min(1).max(50).optional(),
        mainImgUrl: Joi.string().uri().optional(),
    }),
};

export default productSchema;
