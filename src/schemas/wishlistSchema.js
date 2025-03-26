import Joi from 'joi';

const wishlistSchema = {
    POST: Joi.object({
        userId: Joi.number().integer().required(),
        productId: Joi.number().integer().required(),
    }),
};

export default wishlistSchema;
