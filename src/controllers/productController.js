import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { getBestPrices } from '../utils/productRepo.js';
import models from '../models/index.js';
const { Product, Price, Store } = models;
import { getProductWithPricesAndSeller } from '../utils/productRepo.js';
import { scrapeAndUpdateProduct } from '../services/ProductScraperService.js';

export const getBestPricesPerStore = async (req, res, next) => {
    try {
        let { productName, storage, ram, color } = req.body;

        if (!productName || !storage) {
            return res.status(400).json({ message: 'Product name and storage are required.' });
        }

        storage = parseInt(storage.trim(), 10);
        if (isNaN(storage)) return res.status(400).json({ message: 'Storage must be a number.' });

        if (ram) {
            ram = parseInt(ram.trim(), 10);
            if (isNaN(ram)) return res.status(400).json({ message: 'RAM must be a number if provided.' });
        }

        if (color) {
            color = color.trim().toLowerCase();
        }

        const product = await getProductWithPricesAndSeller({ name: productName });

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        console.log('Product:', product);
        // Filter prices by variant attributes
        const matchingPrices = product.Prices.filter((price) => {
            const matchesStorage = price.storage_gb === storage;
            const matchesRam = !ram || price.ram_gb === ram;
            const matchesColor = !color || price.color.toLowerCase() === color.toLowerCase();
            return matchesStorage && matchesRam && matchesColor;
        });

        // Pick best price per store (lowest price)
        const bestPricesMap = {};
        for (const price of matchingPrices) {
            const storeName = price.SellerStore?.Store?.name;
            if (!storeName) continue;

            if (!bestPricesMap[storeName] || parseFloat(price.price) < parseFloat(bestPricesMap[storeName].price)) {
                bestPricesMap[storeName] = price;
            }
        }

        const bestPrices = Object.values(bestPricesMap);

        res.json(bestPrices);
    } catch (err) {
        next(err);
    }
};

export const updateProductPriceNow = async (req, res, next) => {
    try {
        const { productId, Product_link, color, ram_gb, storage_gb } = req.body;

        if (!productId || !Product_link) {
            return res.status(400).json({ message: 'productId and Product_link are required.' });
        }

        const data = await scrapeAndUpdateProduct({ productId, Product_link, color, ram_gb, storage_gb });

        res.json({ message: 'Price updated successfully', data });
    } catch (err) {
        console.error(err);
        next(err);
    }
};

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
