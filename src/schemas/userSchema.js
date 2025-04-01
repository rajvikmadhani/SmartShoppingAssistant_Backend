import Joi from 'joi';

const userSchema = {
    POST: Joi.object({
        name: Joi.string().min(3).max(50).required(),
        surname: Joi.string().min(3).max(50).optional(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        street: Joi.string().min(5).max(100).optional(),
        city: Joi.string().min(2).max(50).optional(),
        zipcode: Joi.string()
            .pattern(/^\d{5,10}$/)
            .optional(),
        about: Joi.string().min(10).max(500).optional(),
        phone: Joi.string()
            .pattern(/^\d{10,15}$/)
            .optional(),
    }),

    PUT: Joi.object({
        name: Joi.string().min(3).max(50).optional(),
        surname: Joi.string().min(3).max(50).optional(),
        email: Joi.string().email().optional(),
        password: Joi.string().min(6).optional(),
        street: Joi.string().min(5).max(100).optional(),
        city: Joi.string().min(2).max(50).optional(),
        zipcode: Joi.string()
            .pattern(/^\d{5,10}$/)
            .optional(),
        about: Joi.string().min(10).max(500).optional(),
        phone: Joi.string()
            .pattern(/^\d{10,15}$/)
            .optional(),
    }),
};

export default userSchema;
