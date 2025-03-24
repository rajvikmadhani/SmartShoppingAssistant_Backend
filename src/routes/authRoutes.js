import { Router } from 'express';
import { login, register, profile } from '../controllers/authController.js';
import validateSchema from '../middleware/validateSchema.js';
import userSchema from '../schemas/user.js';
import authMiddleware from '../middleware/authMiddleware.js';
const authRoutes = Router();

// Login route (No validation since it's not in the schema)
authRoutes.post('/login', validateSchema(userSchema), login);
authRoutes.post('/register', validateSchema(userSchema), register);
authRoutes.get('/profile', authMiddleware, profile);

export default authRoutes;
////
