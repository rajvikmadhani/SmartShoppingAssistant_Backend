import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import validateSchema from '../middleware/validateSchema.js';
import { userSchema, userSchemaForLogin } from '../schemas/userSchema.js';
const authRoutes = Router();

// Login route (No validation since it's not in the schema)
authRoutes.post('/login', validateSchema(userSchemaForLogin), login);
authRoutes.post('/register', validateSchema(userSchema), register);

export default authRoutes;
////
