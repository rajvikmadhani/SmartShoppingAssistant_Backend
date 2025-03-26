import Joi from 'joi';

const priceAlertSchema = {
    POST: Joi.object({
        userId: Joi.number().integer().required(),
        productId: Joi.number().integer().required(),
        targetPrice: Joi.number().precision(2).min(0).required(),
    }),
};

export default priceAlertSchema;
