import Wishlist from '../models/wishlist.js';

// Add product to wishlist
export const addToWishlist = asyncHandler(async (req, res, next) => {
    const { userId, productId } = req.body;
    const item = await Wishlist.create({ userId, productId });
    res.status(201).json(item);
});

// Get wishlist for a user
export const getWishlist = asyncHandler(async (req, res, next) => {
    const wishlist = await Wishlist.findAll({ where: { userId: req.params.userId } });
    res.json(wishlist);
});

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
    const item = await Wishlist.findByPk(req.params.id);
    if (!item) {
        return next(new ErrorResponse('Wishlist item not found', 404));
    }
    await item.destroy();
    res.json({ message: 'Product removed from wishlist' });
});
