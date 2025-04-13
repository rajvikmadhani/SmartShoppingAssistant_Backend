export async function scrapeEbayProduct(productLink) {
    console.log('🔍 Mock scraping eBay product page:', productLink);

    return {
        price: '679.0',
        currency: 'EUR',
        availability: 'true',
        discount: '5',
        shippingCost: '3.5',
        mainImgUrl: 'https://via.placeholder.com/300x300?text=eBay+Product',
        product_rating: '4.3',
        storeId: 'd4fc3e63-6b44-4662-a710-d3918116a90a',
    };
}
