// controllers/productController.js
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import Product from '../models/product.js';
import Price from '../models/price.js';
import ScrapingJob from '../models/scrapingJob.js';
import { scrapeProductData } from '../services/scraperService.js';

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

// Search for a product
export const searchProduct = asyncHandler(async (req, res, next) => {
    const { query } = req.query;
    if (!query) {
        return next(new ErrorResponse('Search query is required', 400));
    }

    let product = await Product.findOne({ where: { name: query } });

    // If product exists and has recent price data, return it
    if (product) {
        const recentPrice = await Price.findOne({
            where: { productId: product.id },
            order: [['updatedAt', 'DESC']],
        });
        if (recentPrice && new Date() - new Date(recentPrice.updatedAt) < 24 * 60 * 60 * 1000) {
            return res.json({ product, price: recentPrice });
        }
    }

    // Otherwise, initiate scraping job
    const scrapingJob = await ScrapingJob.create({
        productName: query,
        status: 'pending',
    });

    // Scrape product data asynchronously
    scrapeProductData(query, scrapingJob.id);

    res.json({ message: 'Product search initiated. Check back later for results.' });
});

// Add a new product
export const addProduct = asyncHandler(async (req, res, next) => {
    const { name, description, category } = req.body;
    const product = await Product.create({ name, description, category });
    res.status(201).json(product);
});

// Delete a product
export const deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
        return next(new ErrorResponse('Product not found', 404));
    }
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
});
