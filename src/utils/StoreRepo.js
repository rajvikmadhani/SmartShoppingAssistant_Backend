import models from '../models/index.js';
const { Price, SellerStore, Store } = models;

export const getStoreByPriceId = async (priceId) => {
    const price = await Price.findByPk(priceId, {
        include: {
            model: SellerStore,
            include: {
                model: Store,
            },
        },
    });

    if (!price?.SellerStore?.Store) {
        throw new Error('Store not found for this priceId');
    }

    return price.SellerStore.Store;
};
export const getOrCreateSellerStore = async (storeId, sellerName, rating) => {
    // First, find or create the seller
    const [seller] = await models.Seller.findOrCreate({
        where: { name: sellerName },
        defaults: { name: sellerName },
    });

    // Then find or create the SellerStore relationship
    const [sellerStore] = await models.SellerStore.findOrCreate({
        where: {
            sellerId: seller.id,
            storeId: storeId,
        },
        defaults: {
            sellerId: seller.id,
            storeId: storeId,
            rating: rating || 0.0,
        },
    });

    return sellerStore;
};
