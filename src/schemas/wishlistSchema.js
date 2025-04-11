import Joi from 'joi';

const uuid = Joi.string().uuid();

const wishlistSchema = {
    POST: Joi.object({
        productId: uuid.required(),
        priceId: uuid.required(),
        note: Joi.string().max(255).optional(),
    }),
    PUT: Joi.object({
        note: Joi.string().max(255).required(),
    }),
};

export default wishlistSchema;
