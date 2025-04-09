import { Router } from 'express';
import { getUserById, deleteUser, updateUserProfile, getUserProfile } from '../controllers/userController.js';
import validateSchema from '../middleware/validateSchema.js';
import { userSchema } from '../schemas/userSchema.js';

const userRouter = Router();
userRouter.get('/profile/', getUserProfile); // Get logged-in user's profile
userRouter.get('/:id', getUserById); // Get user by ID (Admin use case)
userRouter.put('/profile', validateSchema(userSchema), updateUserProfile); // Update profile
userRouter.delete('/profile', deleteUser); // Delete account

export default userRouter;
