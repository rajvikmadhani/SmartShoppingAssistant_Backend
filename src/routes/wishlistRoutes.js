import { Router } from 'express';
import { getAllWishlists, createWishlist, deleteWishlist } from '../controllers/wishlistController.js';
import validateSchema from '../middleware/validateSchema.js';
import wishlistSchema from '../schemas/wishlistSchema.js';

const wishlistRouter = Router();
wishlistRouter.get('/', getAllWishlists);
wishlistRouter.post('/', validateSchema(wishlistSchema.POST), createWishlist);
wishlistRouter.delete('/:id', deleteWishlist);
export default wishlistRouter;
