import Joi from 'joi';

const priceSchema = {
    POST: Joi.object({
        productId: Joi.number().integer().required(),
        storeId: Joi.number().integer().required(),
        price: Joi.number().precision(2).min(0).required(),
        currency: Joi.string().length(3).required(),
    }),
    PUT: Joi.object({
        price: Joi.number().precision(2).min(0).optional(),
        currency: Joi.string().length(3).optional(),
    }),
};

export default priceSchema;
