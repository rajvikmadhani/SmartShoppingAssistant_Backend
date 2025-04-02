import Joi from 'joi';

const priceHistorySchema = {
    POST: Joi.object({
        productId: Joi.number().integer().required(),
        storeId: Joi.number().integer().required(),
        price: Joi.number().precision(2).min(0).required(),
        recordedAt: Joi.date().iso().required(),
    }),
};

export default priceHistorySchema;
