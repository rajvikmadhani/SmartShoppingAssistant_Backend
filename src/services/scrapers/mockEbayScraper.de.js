export const mockEbayScraper = async (query) => {
    return [
        {
            title: 'iPhone 13',
            price: '249,00',
            currency: '€',
            brand: 'Apple',
            availability: '1',
            storage_gb: 128,
            rating: '4.5',
            link: 'https://www.ebay.de/itm/197167998773?_skw=iphone&epid=23049396269',
            image: 'https://i.ebayimg.com/images/g/PJEAAeSw8p5n6-zN/s-l500.webp',
            seller: 'Apple',
            productSellerRate: '0',
            badge: 'no info',
            isPrime: true,
            delivery: 'No info',
            store: 'Ebay',
            availability: '1',
            currency: '€',
            seller_rating: '4.5',
        },
    ].filter((product) =>
        Object.entries(query).every(([key, value]) => {
            // Check if the product property exists and is a string
            return typeof product[key] === 'string' && product[key].toLowerCase().includes(value.toLowerCase());
        })
    );
};
