import { Router } from 'express';
import { scrapeProduct } from '../controllers/liveDataController.js';

const liveDataRoutes = Router();
liveDataRoutes.get('/', scrapeProduct);
export default liveDataRoutes;
