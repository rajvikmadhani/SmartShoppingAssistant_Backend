export async function scrapeAmazonProduct(productLink) {
    console.log('🔍 Mock scraping Amazon product page:', productLink);

    // Simulated scraped result
    return {
        price: 749.99,
        currency: 'EUR',
        availability: 'In Stock',
        discount: 10,
        shippingCost: 4.99,
        mainImgUrl: 'https://via.placeholder.com/300x300?text=Amazon+Product',
        product_rating: 4.5,
    };
}
