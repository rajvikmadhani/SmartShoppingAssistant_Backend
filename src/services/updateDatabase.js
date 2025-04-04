import models from '../models/index.js'; // Added import
import { textToNumber } from '../utils/textToNumberConvertor.js';
export const updatePrices = async (product, scrapedData) => {
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

export const updateNewProduct = async (productId, scrapedData) => {
    if (!scrapedData || !scrapedData.length) {
        console.log('No scraped data available');
        return null;
    }

    console.log('Scraped Data length:', scrapedData.length);

    try {
        // Find the product by ID
        const product = await Product.findByPk(productId);

        if (!product) {
            console.log(`Product with ID ${productId} not found`);
            return null;
        }

        const data = scrapedData[0]; // Get the first item from scraped data

        // Update product fields directly from scraped data
        product.name = data.name || product.name;
        product.description = data.description || product.description;
        product.brand = data.brand || product.brand;
        product.ram_gb = data.ram_gb || product.ram_gb;
        product.storage_gb = data.storage_gb || product.storage_gb;
        product.color = data.color || product.color;
        product.mainImgUrl = data.mainImgUrl || data.image || product.mainImgUrl;

        // Save the updated product
        await product.save();

        console.log('Product updated successfully:', product.id);
        return product;
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
};
