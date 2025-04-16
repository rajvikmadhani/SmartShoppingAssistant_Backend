import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const amazonScraper = async (query, domain = 'de') => {
    const isServerless = process.env.RENDER === 'true';
    let browser;

    try {
        // Launch browser
        browser = await (isServerless
            ? puppeteerCore.launch({
                  args: chromium.args,
                  defaultViewport: chromium.defaultViewport,
                  executablePath: await chromium.executablePath(),
                  headless: chromium.headless,
              })
            : puppeteer.launch({
                  headless: true,
                  args: ['--no-sandbox', '--disable-setuid-sandbox'],
              }));

        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
        );
        await page.setViewport({ width: 1280, height: 800 });

        const baseUrl = `https://www.amazon.${domain}/s?k=${encodeURIComponent(query)}`;
        let currentPageUrl = baseUrl;
        let currentPage = 1;
        const allResults = [];

        while (currentPageUrl) {
            console.log(`scraping page ${currentPage}: ${currentPageUrl}`);
            await page.goto(currentPageUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Accept cookies if needed
            try {
                await page.waitForSelector('input[name="accept"]', { timeout: 1000 });
                await page.click('input[name="accept"]');
                await page.waitForTimeout(1000);
                console.log('accepted cookies');
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
                    const asin = el.getAttribute('data-asin');
                    const link = asin ? `https://www.amazon.de/dp/${asin}` : undefined;
                    const badge = el.querySelector('.s-badge-text')?.innerText;
                    const isPrime = !!el.querySelector('.a-icon-prime');
                    const delivery = el.querySelector('.a-color-base.a-text-bold')?.innerText;

                    const currency = priceText?.match(/(€|\$|£)/)?.[1] || '€';
                    const price = priceText?.replace(/[^\d,.]/g, '');

                    let brand = 'Unknown';
                    for (const b of knownBrands) {
                        if (title?.toLowerCase().includes(b.toLowerCase())) {
                            brand = b;
                            break;
                        }
                    }

                    const storageMatch = title?.match(/(\d+)\s?(GB|Gb|Go)/);
                    const storage_gb = storageMatch ? parseInt(storageMatch[1]) : null;

                    const availability = el.innerText.includes('Auf Lager') ? '1' : '0';
                    const seller_rating = rating;

                    if (title && price) {
                        items.push({
                            title,
                            price,
                            currency,
                            brand,
                            availability,
                            storage_gb,
                            link,
                            image,
                            rating,
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

            // Check for next page
            const nextPagePath = await page.evaluate(() => {
                const nextOld = document.querySelector('ul.a-pagination li.a-last a');
                const nextNew = document.querySelector('a.s-pagination-next');
                return nextOld?.getAttribute('href') || nextNew?.getAttribute('href') || null;
            });

            if (!nextPagePath) {
                console.log('No more pages.');
                break;
            }

            currentPageUrl = `https://www.amazon.${domain}${nextPagePath}`;
            currentPage++;
        }

        return allResults;
    } catch (err) {
        console.error('❌ Error in amazonScraper:', err);
        return [];
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.error('Error closing browser:', closeErr);
            }
        }
    }
};
