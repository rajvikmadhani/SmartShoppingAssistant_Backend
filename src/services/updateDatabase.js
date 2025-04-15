// updateDatabase.js
import models from '../models/index.js';
import { textToNumber } from '../utils/textToNumberConvertor.js';
import { extractColorFromTitle, extractBrandFromTitle } from '../utils/FilterScrappingResult.js';
import { checkAlertsAndEnqueueNotifications } from '../services/AlertService/alertService.js';
import { getOrCreateSellerStore } from '../utils/StoreRepo.js';
// Function to get or create a SellerStore record

export const updatePrices = async (product, scrapedData) => {
    if (!scrapedData.length) return null;
    console.log('Scraped Data length:', scrapedData.length);

    for (const data of scrapedData) {
        // console.log('Scraped Data:', data);
        const {
            title,
            price,
            currency,
            availability,
            productSellerRate,
            image,
            ram_gb,
            storage_gb,
            storeId,
            link,
            shippingCost = '-1',
            discount = '0',
            seller_rating,
            seller,
        } = data;
        // Get or create the SellerStore record
        const sellerStore = await getOrCreateSellerStore(storeId, seller || 'Unknown Seller', seller_rating);
        const existing = await models.Price.findOne({
            where: {
                productId: product.id,
                sellerStoreId: sellerStore.id,
                ram_gb: ram_gb || 0,
                storage_gb: storage_gb || 0,
                color: extractColorFromTitle(title),
                product_link: link,
            },
        });

        // Insert or update the Price row, and return the instance
        const [priceEntry, created] = await models.Price.upsert(
            {
                productId: product.id,
                sellerStoreId: sellerStore.id,
                price: textToNumber(price),
                currency,
                availability,
                mainImgUrl: image || 'Not Available',
                ram_gb: ram_gb || 0,
                storage_gb: storage_gb || 0,
                color: extractColorFromTitle(title),
                product_link: link || 'Not Available',
                shippingCost: textToNumber(shippingCost),
                discount: textToNumber(discount),
                product_rating: productSellerRate,
                lastUpdated: new Date(),
            },
            {
                returning: true,
                conflictFields: ['productId', 'color', 'ram_gb', 'storage_gb', 'sellerStoreId', 'product_link'],
            }
        );

        // Check alerts and enqueue notifications for this price variant
        await checkAlertsAndEnqueueNotifications(product.id, priceEntry);

        // Use the returned priceId directly for history
        await models.PriceHistory.create({
            priceId: priceEntry.id,
            price: textToNumber(price),
            currency,
            availability,
            recordedAt: new Date(),
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
