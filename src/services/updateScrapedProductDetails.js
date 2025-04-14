import models from '../models/index.js';
import { textToNumber } from '../utils/textToNumberConvertor.js';
import { extractColorFromTitle } from '../utils/FilterScrappingResult.js'; // assuming you have this

export async function updateScrapedProductDetails(product, scrapedData) {
    console.log('Updating/inserting scraped data...');

    const {
        price,
        currency,
        availability,
        discount,
        shippingCost,
        mainImgUrl,
        product_rating,
        color,
        ram_gb,
        storage_gb,
        product_link,
        seller,
        seller_rating,
        storeId,
        title,
    } = scrapedData;

    const resolvedColor = extractColorFromTitle(title)?.trim().toLowerCase() ?? 'unknown';

    // First: find an existing Price row
    const existing = await models.Price.findOne({
        where: {
            productId: product.id,
            color: resolvedColor,
            ram_gb: ram_gb || 0,
            storage_gb: storage_gb || 0,
            product_link,
        },
    });

    const sellerStore = await getOrCreateSellerStore(storeId, seller || 'Unknown', seller_rating);

    // Build the update object with fallback logic
    const updatePayload = {
        productId: product.id,
        sellerStoreId: sellerStore.id,
        product_link,
        price: textToNumber(price),
        currency: currency ?? existing?.currency ?? '€',
        availability: availability ?? existing?.availability ?? 'Unknown',
        mainImgUrl: mainImgUrl ?? existing?.mainImgUrl ?? 'Not Available',
        ram_gb: ram_gb ?? existing?.ram_gb ?? 0,
        storage_gb: storage_gb ?? existing?.storage_gb ?? 0,
        color: resolvedColor,
        shippingCost: textToNumber(shippingCost ?? existing?.shippingCost ?? '-1'),
        discount: textToNumber(discount ?? existing?.discount ?? '0'),
        product_rating: product_rating ?? existing?.product_rating ?? null,
        lastUpdated: new Date(),
    };

    if (existing) {
        // Upsert using conflict fields if you want — or do update
        await models.Price.update(updatePayload, {
            where: { id: existing.id },
        });
        console.log(`🔁 Updated existing price record for variant: ${resolvedColor}`);
        return;
    }

    // Only insert if essential fields are present
    if (price && product_link && resolvedColor && storage_gb != null && ram_gb != null) {
        await models.Price.create(updatePayload);
        console.log(`➕ Created new price record for new variant: ${resolvedColor}`);
    } else {
        console.warn(`⚠️ Skipped insert: incomplete scraped data for ${product.name}`);
    }
}
