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
