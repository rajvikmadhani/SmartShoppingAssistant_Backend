import { Router } from 'express';
import { scrapeProduct, refreshProductPrice } from '../controllers/liveDataController.js';

const liveDataRoutes = Router();
liveDataRoutes.put('/:id/refresh', refreshProductPrice);
liveDataRoutes.get('/', scrapeProduct);
export default liveDataRoutes;
