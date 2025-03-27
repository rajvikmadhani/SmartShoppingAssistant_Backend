import Coupon from '../models/coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// Create a new coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
    const { code, discount, expirationDate } = req.body;

    // Validate required fields
    if (!code || !discount || !expirationDate) {
        return next(new ErrorResponse('Code, discount, and expiration date are required', 400));
    }

    // Check if a coupon with the same code already exists
    const existingCoupon = await Coupon.findOne({ where: { code } });
    if (existingCoupon) {
        return next(new ErrorResponse('A coupon with this code already exists', 400));
    }

    // Create the coupon
    const coupon = await Coupon.create({
        code,
        discount,
        expirationDate,
    });

    res.status(201).json({
        message: 'Coupon created successfully',
        coupon,
    });
});

export const getAllCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.findAll();
    res.json(coupons);
});
// Delete a coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find the coupon by ID
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
        return next(new ErrorResponse('Coupon not found', 404));
    }

    // Delete the coupon
    await coupon.destroy();

    res.json({
        message: 'Coupon deleted successfully',
    });
});
