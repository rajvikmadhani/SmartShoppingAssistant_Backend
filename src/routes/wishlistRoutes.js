import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, updateNote } from '../controllers/wishlistController.js';
import validateSchema from '../middleware/validateSchema.js';
import wishlistSchema from '../schemas/wishlistSchema.js';

const wishlistRouter = Router();
wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/', validateSchema(wishlistSchema), addToWishlist);
wishlistRouter.put('/:id', validateSchema(wishlistSchema), updateNote);
wishlistRouter.delete('/:id', removeFromWishlist);
export default wishlistRouter;
