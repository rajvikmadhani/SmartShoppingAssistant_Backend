/**
 * Filters scraped product results based on a query object.
 * @param {Array<Object>} products - The list of products to filter.
 * @param {Object} query - An object where each key-value pair is used to match product fields.
 * @returns {Array<Object>} - Filtered list of products.
 */
export function filterScrapedResults(products, query) {
    return products.filter((product) =>
        Object.entries(query).every(([key, value]) => {
            return typeof product[key] === 'string' && product[key].toLowerCase().includes(value.toLowerCase());
        })
    );
}

export function testFilterScrapedResults(products) {
    return products.filter((product) => product.price > 400);
}

export function extractColorFromTitle(title = '') {
    const colors = [
        'Black',
        'White',
        'Blue',
        'Green',
        'Red',
        'Yellow',
        'Purple',
        'Pink',
        'Gray',
        'Grey',
        'Silver',
        'Gold',
        'Midnight',
        'Starlight',
        'Graphite',
        'Space Gray',
        'Pacific Blue',
        'Sierra Blue',
        'Coral',
        'Orange',
        'Lavender',
    ];

    const lowerTitle = title.toLowerCase();
    const matched = colors.find((color) => lowerTitle.includes(color.toLowerCase()));

    return matched || 'Not Available';
}
export function extractBrandFromTitle(title = '') {
    const knownBrands = [
        'Apple',
        'Samsung',
        'Google',
        'OnePlus',
        'Xiaomi',
        'Huawei',
        'Sony',
        'Motorola',
        'Nokia',
        'Asus',
        'Realme',
        'Honor',
        'Oppo',
        'Lenovo',
    ];

    const matchedBrand = knownBrands.find((b) => title.toLowerCase().includes(b.toLowerCase()));

    return matchedBrand || 'Unknown';
}
