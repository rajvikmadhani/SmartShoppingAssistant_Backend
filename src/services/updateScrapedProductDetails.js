import models from '../models/index.js';
import { textToNumber } from '../utils/textToNumberConvertor.js';
import { extractColorFromTitle, extractRamFromTitle } from '../utils/FilterScrappingResult.js';
export async function updateScrapedProductDetails(product, scrapedData) {
    const { price, availability, product_link, title } = scrapedData;
    const resolvedColor = extractColorFromTitle(title)?.trim().toLowerCase() ?? 'unknown';
    const ramFromTitle = extractRamFromTitle(title);
    // Match existing price record by unique variant index
    const existing = await models.Price.findOne({
        where: {
            productId: product.id,
            product_link,
        },
    });

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
        return;
    }

    // Only insert new if all required fields are present
    const fieldsValid = price && product_link && resolvedColor !== 'unknown' && storage;

    if (fieldsValid) {
        await models.Price.create(updatePayload);
        console.log(`➕ Inserted new price variant: ${resolvedColor}, ${ram}GB RAM, ${storage}GB`);
    } else {
        console.warn('⚠️ Skipping insert: scraped data missing essential variant info');
    }
}
