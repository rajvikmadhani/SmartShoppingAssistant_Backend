import { getProductWithPricesAndSeller } from '../utils/productRepo.js';
import { scrapeProductPage } from './scrapers/singleProductScraper.js';
import { updateScrapedProductDetails } from './updateScrapedProductDetails.js';
import { checkAlertsAndEnqueueNotifications } from './AlertService/alertService.js';
export async function scrapeAndUpdateProduct({ productId, Product_link }) {
    const product = await getProductWithPricesAndSeller({ id: productId });
    const productPrice = product?.Prices?.find((p) => p.product_link === Product_link);

    if (!productPrice) {
        throw new Error('Product price not found.', { statusCode: 404 });
    }
    const storeName = productPrice?.SellerStore?.Store?.name;
    const scrapedData = await scrapeProductPage(Product_link, storeName);

    if (!scrapedData || !scrapedData.price) {
        throw new Error('Scraping failed or returned no price.');
    }

    scrapedData.storage_gb = productPrice.storage_gb;
    scrapedData.ram_gb = productPrice.ram_gb;
    scrapedData.color = productPrice.color;

    const updatedPrice = await updateScrapedProductDetails(product, scrapedData);

    if (updatedPrice) {
        await checkAlertsAndEnqueueNotifications(productId, scrapedData);
    }

    return scrapedData;
}
