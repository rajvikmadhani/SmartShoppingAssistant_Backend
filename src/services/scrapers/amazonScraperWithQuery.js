import puppeteer from 'puppeteer';

/**
 * Scrapes Amazon search results with pagination support.
 *
 * @param {Object} productQuery - The search query containing brand, name, storage, RAM, and color.
 * @param {string} amazonDomain - The Amazon domain to scrape (e.g., "amazon.com" or "amazon.de").
 * @returns {Promise<Array>} - Array of product data.
 */
const amazonScraper = async (productQuery, amazonDomain = 'amazon.com') => {
    const { brand, name, storage_gb, ram_gb, color } = productQuery;

    // Construct search query string
    const queryString = `${brand} ${name} ${storage_gb || ''}GB ${ram_gb || ''}GB ${color || ''}`.trim();

    // Construct Amazon search URL
    const baseUrl = `https://${amazonDomain}/s?k=${encodeURIComponent(queryString)}`;
    let currentPageUrl = baseUrl;
    let currentPage = 1;
    const allResults = [];

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    while (currentPageUrl) {
        console.log(`Scraping page ${currentPage} from ${amazonDomain}: ${currentPageUrl}`);

        await page.goto(currentPageUrl, { waitUntil: 'networkidle2' });

        // Handle cookie consent (common on Amazon.de)
        try {
            await page.waitForSelector('input[name="accept"]', { timeout: 1000 });
            await page.click('input[name="accept"]');
            console.log('Accepted cookies');
            await page.waitForTimeout(1000);
        } catch {
            console.log('No cookie prompt found');
        }

        // Extract product data
        const results = await page.evaluate(() => {
            const items = [];

            document.querySelectorAll('.s-main-slot .s-result-item').forEach((el) => {
                const title = el.querySelector('h2 span')?.innerText;
                const price = el.querySelector('.a-price .a-offscreen')?.innerText;
                const rating = el.querySelector('.a-icon-alt')?.innerText;
                const image = el.querySelector('.s-image')?.src;
                const seller = el.querySelector('.a-row.a-size-base.a-color-secondary')?.innerText;
                const badge = el.querySelector('.s-badge-text')?.innerText;
                const isPrime = !!el.querySelector('.a-icon-prime');
                const delivery = el.querySelector('.a-color-base.a-text-bold')?.innerText;
                const asin = el.getAttribute('data-asin');
                const link = asin ? `https://${amazonDomain}/dp/${asin}` : undefined;

                if (title && price) {
                    items.push({
                        title,
                        price,
                        rating,
                        link,
                        image,
                        seller,
                        badge,
                        isPrime,
                        delivery,
                        store: `Amazon (${amazonDomain})`,
                    });
                }
            });

            return items;
        });

        console.log(`Page ${currentPage}: ${results.length} items scraped from ${amazonDomain}`);
        allResults.push(...results);

        // Check for next page
        const nextPagePath = await page.evaluate(() => {
            const nextOld = document.querySelector('ul.a-pagination li.a-last a');
            const nextNew = document.querySelector('a.s-pagination-next');
            return nextOld?.getAttribute('href') || nextNew?.getAttribute('href') || null;
        });

        if (!nextPagePath) {
            console.log(`No more pages found on ${amazonDomain}.`);
            break;
        }

        currentPageUrl = `https://${amazonDomain}${nextPagePath}`;
        currentPage++;
    }

    await browser.close();
    return allResults;
};

export default amazonScraper;
