import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import validateSchema from '../middleware/validateSchema.js';
import wishlistSchema from '../schemas/wishlistSchema.js';

const wishlistRouter = Router();
wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/', validateSchema(wishlistSchema), addToWishlist);
wishlistRouter.delete('/:id', removeFromWishlist);
export default wishlistRouter;
