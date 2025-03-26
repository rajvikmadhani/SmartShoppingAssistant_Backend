import Joi from 'joi';

const couponSchema = {
    POST: Joi.object({
        code: Joi.string().min(3).max(20).required(),
        discount: Joi.number().precision(2).min(0).max(100).required(),
        storeId: Joi.number().integer().required(),
    }),
};

export default couponSchema;
