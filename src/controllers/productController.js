import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import Product from '../models/product.js';
import { getBestPrices } from '../utils/productRepo.js';
// Get all products
export const getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.findAll();
    res.json(products);
});

// Get product by ID
export const getProductById = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }
    res.json(product);
});

// Rest of controller code remains unchanged
export const addProduct = asyncHandler(async (req, res, next) => {
    const { name, description, category } = req.body;
    const product = await Product.create({ name, description, category });
    res.status(201).json(product);
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
});

export const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, category } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;

    await product.save();

    res.json({ message: 'Product updated successfully', product });
});
export const bestPrices = asyncHandler(async (req, res, next) => {
    const bestPrices = await getBestPrices();
    if (!bestPrices) {
        return next(new ErrorResponse('No best prices found', 404));
    }
    res.json(bestPrices);
});
