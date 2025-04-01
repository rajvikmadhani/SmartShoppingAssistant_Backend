import { Router } from 'express';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import validateSchema from '../middleware/validateSchema.js';
import userSchema from '../schemas/userSchema.js';

const userRouter = Router();
userRouter.get('/me', getUserProfile); // Get logged-in user's profile
userRouter.get('/:id', getUserById); // Get user by ID (Admin use case)
userRouter.put('/me', validateSchema(userSchema.PUT), updateUserProfile); // Update profile
userRouter.delete('/me', deleteUser); // Delete account

export default userRouter;
