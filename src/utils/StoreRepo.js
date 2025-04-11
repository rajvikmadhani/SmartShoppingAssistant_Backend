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
