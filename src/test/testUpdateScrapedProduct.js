import { updateScrapedProductDetails } from '../services/updateScrapedProductDetails.js';
import { getProductWithPricesAndSeller } from '../utils/productRepo.js';

const test = async () => {
    const product = await getProductWithPricesAndSeller({ id: '0429792f-3bb5-4d51-be85-8d7926e3b016' });

    const scrapedData = {
        title: 'iPhone 16e 128 GB: Entwickelt für Apple Intelligence, A18 Chip, Gigantische Batterielaufzeit, 48 MP Fusion Kamera, 6,1" Super Retina XDR Display, Schwarz',
        price: '659.00',
        currency: '€',
        availability: true,
        shippingCost: '-1',
        mainImgUrl: 'https://m.media-amazon.com/images/I/61j5RD1d9KL._AC_SX342_.jpg',
        product_rating: null,
        product_link: 'https://www.amazon.de/dp/B0DXQHPY34',
        storeId: 'AMAZON_STORE_UUID',
        ram_gb: 0,
        storage_gb: 0,
        color: 'unknown',
        seller: 'Amazon',
        seller_rating: '5.0',
    };

    await updateScrapedProductDetails(product, scrapedData);
};

test();
