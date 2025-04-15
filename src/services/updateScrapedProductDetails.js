import models from '../models/index.js';
import { textToNumber } from '../utils/textToNumberConvertor.js';
import { extractColorFromTitle, extractRamFromTitle } from '../utils/FilterScrappingResult.js';
export async function updateScrapedProductDetails(product, scrapedData) {
    const { price, availability, product_link, title } = scrapedData;
    const resolvedColor = extractColorFromTitle(title)?.trim().toLowerCase() ?? 'unknown';
    const ramFromTitle = extractRamFromTitle(title);
    // Match existing price record by unique variant index
    console.log('Matching productId:', product.id);
    console.log('Matching product_link:', product_link);

    const priceEntries = await models.Price.findAll({ where: { productId: product.id } });
    console.log(
        'All links in DB:',
        priceEntries.map((p) => p.product_link)
    );

    const existing = await models.Price.findOne({
        where: {
            productId: product.id,
            product_link,
        },
    });
    console.log('existing:', existing);
    const updatePayload = {
        color: resolvedColor,
        ram_gb: ramFromTitle !== -1 ? ramFromTitle : (existing?.ram_gb ?? 0),
        price: textToNumber(price),
        availability: availability ?? existing?.availability ?? 'False',
        lastUpdated: new Date(),
    };

    if (existing) {
        await models.Price.update(updatePayload, { where: { id: existing.id } });
        console.log(
            `Price is Updated. price variant: ${updatePayload.color}, ${updatePayload.ram_gb}GB RAM, ${updatePayload.price} Price`
        );
        const updatedPrice = await models.Price.findByPk(existing.id);
        return updatedPrice;
    }
    console.log('price is not found');
    throw new Error('Price not found for the given product and link.');
}
