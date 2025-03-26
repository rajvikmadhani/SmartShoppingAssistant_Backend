import Store from '../models/store.js';

// Get all stores
export const getAllStores = asyncHandler(async (req, res, next) => {
    const stores = await Store.findAll();
    res.json(stores);
});

// Get store by ID
export const getStoreById = asyncHandler(async (req, res, next) => {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
        return next(new ErrorResponse('Store not found', 404));
    }
    res.json(store);
});

// Add a new store
export const addStore = asyncHandler(async (req, res, next) => {
    const { name, website } = req.body;
    const store = await Store.create({ name, website });
    res.status(201).json(store);
});

// Delete a store
export const deleteStore = asyncHandler(async (req, res, next) => {
    const store = await Store.findByPk(req.params.id);
    if (!store) {
        return next(new ErrorResponse('Store not found', 404));
    }
    await store.destroy();
    res.json({ message: 'Store deleted successfully' });
});
