import Joi from 'joi';

const productSchema = {
    POST: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().min(10).max(1000).optional(),
        brand: Joi.string().min(1).max(255).required(),
    }),
    PUT: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().min(10).max(1000).optional(),
        brand: Joi.string().min(1).max(255).optional(),
    }),
};

export default productSchema;
