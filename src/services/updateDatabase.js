import models from '../models/index.js'; // Added import

export const updateDatabase = async (product, scrapedData) => {
    if (!scrapedData.length) return null;

    if (!product) {
        product = await models.Product.create({ ...scrapedData[0] });
    }

    for (const data of scrapedData) {
        const { price, storeId, product_link, shippingCost, discount, seller_rating } = data;

        await models.PriceHistory.create({
            productId: product.id,
            storeId,
            price,
            product_link,
            shippingCost,
            discount,
            seller_rating,
            lastUpdated: new Date(),
        });

        await models.Price.upsert({
            productId: product.id,
            storeId,
            price,
            product_link,
            shippingCost,
            discount,
            seller_rating,
            lastUpdated: new Date(),
        });
    }

    return product;
};

export default updateDatabase;
