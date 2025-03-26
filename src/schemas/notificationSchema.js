import Joi from 'joi';

const notificationSchema = {
    POST: Joi.object({
        userId: Joi.number().integer().required(),
        message: Joi.string().min(5).max(255).required(),
        read: Joi.boolean().default(false),
    }),
};

export default notificationSchema;
