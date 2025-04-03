import models from '../models/index.js'; // Added import
import { textToNumber } from '../utils/textToNumberConvertor.js';
export const updateDatabase = async (product, scrapedData) => {
    if (!scrapedData.length) return null;
    console.log('Scraped Data length:', scrapedData.length);
    for (const data of scrapedData) {
        console.log('Scraped Data:', data);
        const { price, currency, availability, image, storeId, link, shippingCost, discount, seller_rating } = data;

        await models.PriceHistory.create({
            productId: product.id,
            storeId,
            price: textToNumber(price),
            currency: currency,
            seller_rating,
            lastUpdated: new Date(),
        });

        await models.Price.upsert({
            productId: product.id,
            storeId,
            price: textToNumber(price),
            currency: currency,
            availability: availability,
            product_link: link,
            mainImgUrl: image,
            shippingCost,
            discount,
            seller_rating,
            lastUpdated: new Date(),
        });
    }

    return product;
};

export default updateDatabase;
