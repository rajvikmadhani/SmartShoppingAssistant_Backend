import puppeteer from 'puppeteer';

/**
 * Scrapes Amazon search results with pagination and returns a detailed, normalized product format.
 */
export const amazonScraper = async (query, domain) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const baseUrl = `https://www.amazon.${domain}/s?k=${encodeURIComponent(query)}`;
    let currentPageUrl = baseUrl;
    let currentPage = 1;
    const allResults = [];

    while (currentPageUrl) {
        console.log(`scraping page ${currentPage}: ${currentPageUrl}`);
        await page.goto(currentPageUrl, { waitUntil: 'networkidle2' });

        try {
            await page.waitForSelector('input[name="accept"]', { timeout: 500 });
            await page.click('input[name="accept"]');
            console.log('accepted cookies');
            await page.waitForTimeout(1000);
        } catch {
            console.log('no cookie prompt');
        }

        const results = await page.evaluate(() => {
            const items = [];
            const knownBrands = ['Apple', 'Samsung', 'Sony', 'Google', 'Xiaomi', 'OnePlus', 'Huawei'];

            document.querySelectorAll('.s-main-slot .s-result-item').forEach((el) => {
                const title = el.querySelector('h2 span')?.innerText;
                const priceText = el.querySelector('.a-price .a-offscreen')?.innerText;
                const rating = el.querySelector('.a-icon-alt')?.innerText;
                const image = el.querySelector('.s-image')?.src;
                const seller = el.querySelector('.a-row.a-size-base.a-color-secondary')?.innerText;
                const badge = el.querySelector('.s-badge-text')?.innerText;
                const isPrime = !!el.querySelector('.a-icon-prime');
                const delivery = el.querySelector('.a-color-base.a-text-bold')?.innerText;
                const asin = el.getAttribute('data-asin');
                const link = asin ? `https://www.amazon.de/dp/${asin}` : undefined;
                const productSellerRate = rating;

                //Discount and shipping cost
                const deliveryText = el.innerText.toLowerCase();
                let shippingCost = '0.00';

                if (deliveryText.includes('free delivery') || deliveryText.includes('gratis')) {
                    shippingCost = '0.00';
                } else {
                    const shippingMatch = deliveryText.match(/(?:delivery|shipping).*?(€|\$|£)?\s?(\d+([.,]\d+)?)/i);
                    if (shippingMatch) {
                        shippingCost = shippingMatch[2].replace(',', '.');
                    }
                }
                const originalPriceText = el.querySelector('.a-price.a-text-price span')?.innerText || '';
                const currentPriceText = el.querySelector('.a-price .a-offscreen')?.innerText || '';
                const original = parseFloat(originalPriceText.replace(/[^\d,.-]/g, '').replace(',', '.'));
                const current = parseFloat(currentPriceText.replace(/[^\d,.-]/g, '').replace(',', '.'));
                const discount =
                    !isNaN(original) && !isNaN(current) && original > current
                        ? (original - current).toFixed(2)
                        : '0.00';

                // Normalize price and currency
                const currencyMatch = priceText?.match(/(€|\$|£)/);
                const currency = currencyMatch ? currencyMatch[1] : '€';
                const price = priceText?.replace(/[^\d,.]/g, '');

                // Guess brand
                let detectedBrand = 'Unknown';
                for (const b of knownBrands) {
                    if (
                        title?.toLowerCase().includes(b.toLowerCase()) ||
                        seller?.toLowerCase().includes(b.toLowerCase())
                    ) {
                        detectedBrand = b;
                        break;
                    }
                }

                // Try to detect storage
                const storageMatch = title?.match(/(\d+) ?(GB|Gb|gb|Go)/);
                const storage_gb = storageMatch ? parseInt(storageMatch[1]) : null;
                const ramMatch = title?.match(/(?:^|\\s)(\\d{1,2})\\s?(?:GB|Gb|gb)\\s?(?:RAM)?/i);
                const ram_gb = ramMatch ? parseInt(ramMatch[1]) : null;

                // Placeholder availability
                const availability =
                    el.innerText.includes('In stock') || el.innerText.includes('Available') ? '1' : '0';
                const seller_rating = rating;

                if (title && price) {
                    items.push({
                        title,
                        price,
                        currency,
                        brand: detectedBrand,
                        availability,
                        storage_gb,
                        ram_gb,
                        ramMatch,
                        rating,
                        shippingCost,
                        discount,
                        link,
                        image,
                        seller,
                        productSellerRate,
                        badge,
                        isPrime,
                        delivery,
                        store: 'Amazon',
                        seller_rating,
                    });
                }
            });
            return items;
        });

        console.log(`page ${currentPage}: ${results.length} items scraped`);
        allResults.push(...results);

        const nextPagePath = await page.evaluate(() => {
            const nextOld = document.querySelector('ul.a-pagination li.a-last a');
            const nextNew = document.querySelector('a.s-pagination-next');
            return nextOld?.getAttribute('href') || nextNew?.getAttribute('href') || null;
        });

        if (!nextPagePath) {
            console.log('no more pages found.');
            break;
        }

        currentPageUrl = `https://www.amazon.de${nextPagePath}`;
        currentPage++;
    }

    await browser.close();
    return allResults;
};
