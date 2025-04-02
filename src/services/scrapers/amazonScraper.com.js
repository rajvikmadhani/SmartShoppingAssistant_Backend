import puppeteer from 'puppeteer';

const scrapeAmazon = async (query, maxPages = 3) => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    let currentPageUrl = baseUrl;
    let currentPage = 1;
    const allResults = [];

    while (currentPage <= maxPages && currentPageUrl) {
        console.log(`Scraping Amazon page ${currentPage}: ${currentPageUrl}`);
        await page.goto(currentPageUrl, { waitUntil: 'networkidle2' });

        try {
            await page.waitForSelector('.s-main-slot', { timeout: 5000 });
        } catch {
            console.log('Amazon blocked the request or no results found.');
            break;
        }

        const results = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('.s-main-slot .s-result-item').forEach((el) => {
                const title = el.querySelector('h2 span')?.innerText?.trim();
                const priceText = el.querySelector('.a-price .a-offscreen')?.innerText?.trim();
                const rating = el.querySelector('.a-icon-alt')?.innerText?.trim();
                const image = el.querySelector('.s-image')?.src;
                const seller = el.querySelector('.a-row.a-size-base.a-color-secondary')?.innerText?.trim();
                const badge = el.querySelector('.s-badge-text')?.innerText?.trim();
                const isPrime = !!el.querySelector('.a-icon-prime');
                const delivery = el.querySelector('.a-color-base.a-text-bold')?.innerText?.trim();
                const asin = el.getAttribute('data-asin');
                const link = asin ? `https://www.amazon.com/dp/${asin}` : undefined;
                const availability = el.innerText.includes('Currently unavailable') ? 'out_of_stock' : 'in_stock';

                let price = null,
                    currency = null;
                if (priceText) {
                    const match = priceText.match(/([\$€£])(\d+[.,]?\d*)/);
                    if (match) {
                        currency = match[1];
                        price = parseFloat(match[2].replace(',', ''));
                    }
                }

                if (title && price) {
                    items.push({
                        title,
                        price,
                        currency,
                        rating,
                        link,
                        image,
                        seller,
                        badge,
                        isPrime,
                        delivery,
                        availability,
                        store: 'Amazon',
                    });
                }
            });
            return items;
        });

        console.log(`Page ${currentPage}: ${results.length} items scraped`);
        allResults.push(...results);

        const nextPagePath = await page.evaluate(() => {
            const nextLink =
                document.querySelector('ul.a-pagination li.a-last a') || document.querySelector('a.s-pagination-next');
            return nextLink?.getAttribute('href') || null;
        });

        if (!nextPagePath) {
            console.log('No next page found.');
            break;
        }

        currentPageUrl = `https://www.amazon.com${nextPagePath}`;
        currentPage++;
    }

    await browser.close();
    return allResults;
};

export default scrapeAmazon;
