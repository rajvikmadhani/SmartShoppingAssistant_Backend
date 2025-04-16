import { mockEbayScraper } from './mockEbayScraper.de.js';

export const scrapeEbayProduct = async (link) => {
    try {
        const results = await mockEbayScraper();

        // 3. Try to find the product with matching link
        const matched = results.find((item) => item.link === link);

        if (!matched) {
            console.warn('No matching product found for link:', link);
            return {
                title: 'Unknown',
                price: '0',
                currency: '€',
                availability: false,
                product_link: link,
            };
        }

        // 4. Return the normalized result
        return {
            title: matched.title || 'Unknown',
            price: matched.price || '0',
            currency: matched.currency || '€',
            availability: matched.availability === '1',
            product_link: matched.link,
        };
    } catch (err) {
        console.error('Failed to scrape eBay product:', err);
        return {
            title: 'Unknown',
            price: '0',
            currency: '€',
            availability: false,
            product_link: link,
        };
    }
};
