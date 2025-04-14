import puppeteer from 'puppeteer';

function extractPrice(text) {
    const match = text.match(/[\d.,]+/);
    if (!match) return '0';
    return match[0].replace(',', '.');
}

export async function scrapeAmazonProduct(link) {
    const product = {
        title: 'Unknown',
        price: '0',
        currency: '€',
        availability: 'Unknown',
        discount: '0',
        shippingCost: '-1',
        mainImgUrl: 'Not Available',
        product_rating: null,
        product_link: link,
        storeId: 'AMAZON_STORE_UUID',
        ram_gb: 0,
        storage_gb: 0,
        color: 'unknown',
        seller: 'Amazon',
        seller_rating: '5.0',
    };

    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.goto(link, { waitUntil: 'networkidle2' });

        // Title
        try {
            product.title = await page.$eval('#productTitle', (el) => el.textContent.trim());
        } catch {}

        // Price from multiple fallback selectors
        const priceSelectors = [
            '#priceblock_dealprice',
            '#priceblock_ourprice',
            '#priceblock_saleprice',
            '#price_inside_buybox',
            '#tp_price_block_total_price_ww',
            '#newBuyBoxPrice',
        ];

        for (const selector of priceSelectors) {
            try {
                const raw = await page.$eval(selector, (el) => el.textContent);
                const price = extractPrice(raw);
                if (price && parseFloat(price)) {
                    product.price = price;
                    break;
                }
            } catch {
                continue;
            }
        }

        // Image
        try {
            product.mainImgUrl = await page.$eval('#imgTagWrapperId img', (el) => el.src);
        } catch {}

        // Availability
        try {
            product.availability = await page.$eval('#availability span', (el) => el.textContent.trim());
        } catch {}

        await browser.close();
    } catch (err) {
        console.warn('⚠️ scrapeAmazonProduct failed:', err.message);
    }

    return product;
}
