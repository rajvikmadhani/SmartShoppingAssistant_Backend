import { Router } from 'express';
import {
    getAllProducts,
    addProduct,
    getProductById,
    updateProduct,
    deleteProduct,
} from '../controllers/productController.js';
import validateSchema from '../middleware/validateSchema.js';
import productSchema from '../schemas/productSchema.js';

const productRouter = Router();
productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.post('/', validateSchema(productSchema), addProduct);
productRouter.put('/:id', validateSchema(productSchema), updateProduct);
productRouter.delete('/:id', deleteProduct);
export default productRouter;
