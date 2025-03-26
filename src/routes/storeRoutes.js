import { Router } from 'express';
import { getAllStores, createStore, getStoreById, updateStore, deleteStore } from '../controllers/storeController.js';
import validateSchema from '../middleware/validateSchema.js';
import storeSchema from '../schemas/storeSchema.js';

const storeRouter = Router();
storeRouter.get('/', getAllStores);
storeRouter.get('/:id', getStoreById);
storeRouter.post('/', validateSchema(storeSchema.POST), createStore);
storeRouter.put('/:id', validateSchema(storeSchema.PUT), updateStore);
storeRouter.delete('/:id', deleteStore);
export default storeRouter;
