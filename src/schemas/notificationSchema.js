import Joi from 'joi';

const notificationSchema = {
    POST: Joi.object({
        userId: Joi.string().guid().required(),
        message: Joi.string().min(5).max(255).required(),
        read: Joi.boolean().default(false),
    }),
};
export default notificationSchema;
