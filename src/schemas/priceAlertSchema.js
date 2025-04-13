import Joi from 'joi';
const uuid = Joi.string().uuid();

const priceAlertSchema = {
    POST: Joi.object({
        productId: uuid.required(),
        threshold: Joi.number().precision(2).min(0).required(),
        storage_gb: Joi.number().integer().min(1).required(),
    }),
};

export default priceAlertSchema;
