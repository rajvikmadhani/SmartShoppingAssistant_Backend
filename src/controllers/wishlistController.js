import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import models from '../models/index.js';
import { getStoreByPriceId } from '../utils/StoreRepo.js';
const { Wishlist, Product, Price } = models;

// Add product to wishlist
export const addToWishlist = asyncHandler(async (req, res, next) => {
    try {
        const { productId, priceId, note } = req.body;

        // Validate ownership (price must belong to product)
        const price = await Price.findByPk(priceId);
        if (!price || price.productId !== productId) {
            return res.status(400).json({ error: 'Invalid product/price combination' });
        }

        // Prevent duplicates
        const existing = await Wishlist.findOne({
            where: { userId: req.user.id, productId, priceId },
        });
        if (existing) {
            return res.status(409).json({ error: 'Item already in wishlist' });
        }

        const wishlistItem = await Wishlist.create({
            userId: req.user.id,
            productId,
            priceId,
            note,
        });

        res.status(201).json(wishlistItem);
    } catch (err) {
        console.error(err);
        throw new ErrorResponse('Failed to add to wishlist', 500);
    }
});

// Get wishlist for a user
export const getWishlist = asyncHandler(async (req, res, next) => {
    const items = await Wishlist.findAll({
        where: { userId: req.user.id },
        include: [
            { model: Product },
            {
                model: Price,
                include: [
                    {
                        model: models.SellerStore,
                        include: [
                            {
                                model: models.Seller,
                                attributes: ['name'],
                            },
                        ],
                    },
                ],
            },
        ],
        order: [['createdAt', 'DESC']],
    });

    // if (!items || items.length === 0) {
    //     throw new ErrorResponse('No wishlist items found', 404);
    // }
    // const enrichedItems = await Promise.all(
    //     items.map(async (item) => {
    //         const store = await getStoreByPriceId(item.priceId);
    //         return {
    //             ...item.toJSON(),
    //             store, // Add store info into the returned object
    //         };
    //     })
    // );
    res.json(items);
});

export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const wishlistItem = await Wishlist.findOne({
            where: { id, userId: req.user.id },
        });

        if (!wishlistItem) {
            throw new ErrorResponse('Wishlist item not found', 404);
        }

        wishlistItem.note = note;
        await wishlistItem.save();

        res.json(wishlistItem);
    } catch (err) {
        throw new ErrorResponse('Failed to update wishlist item', 500);
    }
};

// Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleted = await Wishlist.destroy({
            where: { id, userId: req.user.id },
        });

        if (!deleted) {
            throw new ErrorResponse('Wishlist item not found', 404);
        }

        res.status(204).send();
    } catch (err) {
        throw new ErrorResponse('Failed to remove item from wishlist', 500);
    }
});
