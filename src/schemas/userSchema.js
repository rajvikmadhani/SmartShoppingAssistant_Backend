import Joi from 'joi';

const userSchema = {
    POST: Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    }),
    PUT: Joi.object({
        username: Joi.string().min(3).max(50).optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().min(6).optional(),
    }),
};

export default userSchema;
