import { Router } from 'express';
import {
    getBestPricesPerStore,
    getAllProducts,
    addProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    bestPrices,
} from '../controllers/productController.js';
import validateSchema from '../middleware/validateSchema.js';
import productSchema from '../schemas/productSchema.js';

const productRouter = Router();
productRouter.get('/best-prices/', bestPrices);
productRouter.post('/best-store-prices', getBestPricesPerStore);
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', validateSchema(productSchema), addProduct);
productRouter.put('/:id', validateSchema(productSchema), updateProduct);
productRouter.delete('/:id', deleteProduct);

export default productRouter;
