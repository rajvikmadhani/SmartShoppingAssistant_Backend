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
    const colorMap = {
        Black: 'Schwarz',
        White: 'Weiß',
        Blue: 'Blau',
        Green: 'Grün',
        Red: 'Rot',
        Yellow: 'Gelb',
        Purple: 'Lila', // or "Violett"
        Pink: 'Rosa',
        Gray: 'Grau',
        Grey: 'Grau',
        Silver: 'Silber',
        Gold: 'Gold',
        Midnight: 'Mitternacht',
        Starlight: 'Sternenlicht',
        Graphite: 'Graphit',
        'Space Gray': 'Space Grau',
        'Pacific Blue': 'Pazifikblau',
        'Sierra Blue': 'Sierra Blau',
        Coral: 'Koralle',
        Orange: 'Orange',
        Lavender: 'Lavendel',
    };

    const lowerTitle = title.toLowerCase();

    for (const [english, german] of Object.entries(colorMap)) {
        if (lowerTitle.includes(english.toLowerCase()) || lowerTitle.includes(german.toLowerCase())) {
            return english; // or return german if you prefer localizing the result
        }
    }

    return 'Not Available';
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
export function extractRamFromTitle(title) {
    if (!title || typeof title !== 'string') return -1;

    // Common formats: "8 GB RAM", "8GB", "8GB/128GB", "12 GB/256 GB"
    const ramRegex = /(\d{1,3})\s?(GB|GByte)\s?(RAM)?/i;

    const match = title.match(ramRegex);
    if (match && match[1]) {
        return parseInt(match[1]);
    }

    return -1;
}
