import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const validateSchema = (schema) => {
    return asyncHandler(async (req, res, next) => {
        try {
            await schema[req.method].validateAsync(req.body);
            next();
        } catch (error) {
            throw new ErrorResponse('validation error. ' + error.message, 400);
        }
    });
};

export default validateSchema;
