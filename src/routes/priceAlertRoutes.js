import { Router } from 'express';
import { getAllPriceAlerts, createPriceAlert, deletePriceAlert } from '../controllers/priceAlertController.js';
import validateSchema from '../middleware/validateSchema.js';
import priceAlertSchema from '../schemas/priceAlertSchema.js';

const priceAlertRouter = Router();
priceAlertRouter.get('/', getAllPriceAlerts);
priceAlertRouter.post('/', validateSchema(priceAlertSchema.POST), createPriceAlert);
priceAlertRouter.delete('/:id', deletePriceAlert);
export default priceAlertRouter;
