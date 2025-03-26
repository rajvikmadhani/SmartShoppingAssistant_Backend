import { Router } from 'express';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import validateSchema from '../middleware/validateSchema.js';
import userSchema from '../schemas/userSchema.js';

const userRouter = Router();
userRouter.get('/', getAllUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/', validateSchema(userSchema.POST), createUser);
userRouter.put('/:id', validateSchema(userSchema.PUT), updateUser);
userRouter.delete('/:id', deleteUser);
export default userRouter;
