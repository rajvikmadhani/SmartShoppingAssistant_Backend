// updateDatabase.js
import models from '../models/index.js';
import { textToNumber } from '../utils/textToNumberConvertor.js';
import { extractColorFromTitle, extractBrandFromTitle } from '../utils/FilterScrappingResult.js';
// Function to get or create a SellerStore record
async function getOrCreateSellerStore(storeId, sellerName, rating) {
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
}

export const updatePrices = async (product, scrapedData) => {
    if (!scrapedData.length) return null;
    console.log('Scraped Data length:', scrapedData.length);

    for (const data of scrapedData) {
        console.log('Scraped Data:', data);
        const {
            title,
            price,
            currency,
            availability,
            image,
            storeId,
            link,
            color,
            shippingCost,
            discount,
            seller_rating,
            seller,
        } = data;
        // Get or create the SellerStore record
        const sellerStore = await getOrCreateSellerStore(storeId, seller || 'Unknown Seller', seller_rating);

        // Create price history with sellerStoreId
        await models.PriceHistory.create({
            productId: product.id,
            sellerStoreId: sellerStore.id,
            price: textToNumber(price),
            currency: currency,
            lastUpdated: new Date(),
        });

        // Update or create price with sellerStoreId
        await models.Price.upsert({
            productId: product.id,
            sellerStoreId: sellerStore.id,
            price: textToNumber(price),
            currency: currency,
            availability: availability,
            mainImgUrl: image || 'Not Available',
            color: extractColorFromTitle(title),
            product_link: link || 'Not Available',
            shippingCost: textToNumber(shippingCost),
            discount: textToNumber(discount),
            seller_rating, // Consider removing this since it's in SellerStore
            lastUpdated: new Date(),
        });
    }

    return product;
};
export const updateProducts = async (productId, scrapedData) => {
    console.log('Updating new product with ID:', productId);
    if (!scrapedData || !scrapedData.length) {
        console.log('No scraped data available');
        return null;
    }

    try {
        // Find the product by ID
        const product = await models.Product.findByPk(productId);
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
        product.brand = extractBrandFromTitle(data.title) || product.brand;
        // Save the updated product
        await product.save();

        console.log('Product updated successfully:', product.id);
        return product;
    } catch (error) {
        console.error('Error updating product:', error);
        return null;
    }
};
