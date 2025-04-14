export async function scrapeAmazonProduct(productLink) {
    console.log('🔍 Mock scraping Amazon product page:', productLink);

    // Simulated scraped result
    return {
        title: 'iPhone 15',
        color: 'pink',
        price: '497',
        currency: '€',
        brand: 'Apple',
        availability: '1',
        storage_gb: 128,
        ram_gb: 512,
        rating: '4.6',
        link: 'https://www.amazon.com/dp/B0BNMBHM8Z',
        image: 'https://m.media-amazon.com/images/I/61tz1qzH++L._AC_UY218_.jpg',
        seller: 'Apple',
        productSellerRate: '4.1',
        badge: "Amazon's Choice",
        isPrime: true,
        delivery: 'Tomorrow',
        store: 'Amazon',
        availability: '1',
        currency: '€',
        seller_rating: '5',
        storeId: '38a1762b-96e1-487c-8092-ff238ac5d919',
    };
}
