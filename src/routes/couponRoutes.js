import { Router } from 'express';
import { getAllCoupons, createCoupon, deleteCoupon } from '../controllers/couponController.js';
import validateSchema from '../middleware/validateSchema.js';
import couponSchema from '../schemas/couponSchema.js';

const couponRouter = Router();
couponRouter.get('/', getAllCoupons);
couponRouter.post('/', validateSchema(couponSchema.POST), createCoupon);
couponRouter.delete('/:id', deleteCoupon);
export default couponRouter;
