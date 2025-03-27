import { Router } from 'express';
import { getAllPrices, createPrice, getPriceById, updatePrice, deletePrice } from '../controllers/priceController.js';
import validateSchema from '../middleware/validateSchema.js';
import priceSchema from '../schemas/priceSchema.js';

const priceRouter = Router();
priceRouter.get('/', getAllPrices);
priceRouter.get('/:id', getPriceById);
priceRouter.post('/', validateSchema(priceSchema), createPrice);
priceRouter.put('/:id', validateSchema(priceSchema), updatePrice);
priceRouter.delete('/:id', deletePrice);
export default priceRouter;
