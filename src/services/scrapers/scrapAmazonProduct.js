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
        availability: false,
        product_link: link,
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
            product.availability = await page.$eval('#availability span', (el) => {
                const text = el.textContent.trim().toLowerCase();
                return (
                    text.includes('auf lager') ||
                    text.includes('available') ||
                    text.includes('derzeit verfügbar') ||
                    text.includes('nur noch')
                );
            });
        } catch {
            product.availability = false; // fallback if selector not found
        }
        console.log('availability value:', product.availability, '| typeof:', typeof product.availability);

        await browser.close();
    } catch (err) {
        console.warn('⚠️ scrapeAmazonProduct failed:', err.message);
    }

    return product;
}
