import asyncHandler from '../middleware/asyncHandler.js';
import Coupon from '../models/coupon.js';
export const getAllCoupons = asyncHandler(async (req, res, next) => {
    const coupons = await Coupon.findAll();
    res.json(coupons);
});
