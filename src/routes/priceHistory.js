import { Router } from 'express';
import { getPriceHistory, getChartData } from '../controllers/priceHistoryController.js';

const priceHistoryRouter = Router();
priceHistoryRouter.get('/chart/:productId', getChartData);
priceHistoryRouter.get('/:productId', getPriceHistory);
export default priceHistoryRouter;
