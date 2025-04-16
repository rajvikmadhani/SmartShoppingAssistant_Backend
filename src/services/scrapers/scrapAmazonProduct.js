import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

function extractPrice(text) {
    if (!text) return '0';

    // First clean up the text by removing currency symbols and non-numeric characters
    // except for decimals and thousands separators
    const cleaned = text.replace(/[^\d,.-]/g, '');

    // Handle different international formats:
    // - European format: 1.299,95 -> 1299.95
    // - US/UK format: 1,299.95 -> 1299.95

    // Detect format by checking if there's a comma followed by exactly 2 digits at the end
    const isEuropeanFormat = /,\d{2}$/.test(cleaned);

    let standardized;
    if (isEuropeanFormat) {
        // European format: replace dots (thousands) then convert comma to dot (decimal)
        standardized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
        // US/UK format: remove commas
        standardized = cleaned.replace(/,/g, '');
    }

    // Parse to ensure we return a valid number or 0
    const parsedValue = parseFloat(standardized);
    return isNaN(parsedValue) ? '0' : parsedValue.toString();
}

export async function scrapeAmazonProduct(link) {
    const product = {
        title: 'Unknown',
        price: '0',
        currency: '€',
        availability: false,
        product_link: link,
        rawPrice: '0',
    };

    console.log(`Starting Amazon scraping for: ${link}`);
    let browser;
    try {
        const isServerlessEnv = process.env.RENDER === 'true';

        console.log(`Is serverless environment: ${isServerlessEnv}`);
        if (isServerlessEnv) {
            // Use @sparticuz/chromium on serverless environments
            console.log('Running in serverless mode with chromium');
            browser = await puppeteerCore.launch({
                args: [...chromium.args, '--no-sandbox'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            // Use regular puppeteer for local development
            console.log('Running in local development mode');
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
        }
        const page = await browser.newPage();

        // Set a user agent to avoid detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
        );

        // Set viewport size
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to Amazon page...');
        await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });

        // Take screenshot for debugging (optional)
        // await page.screenshot({ path: 'amazon-debug.png' });

        // Title
        try {
            product.title = await page.$eval('#productTitle', (el) => el.textContent.trim());
            console.log(`Found product title: ${product.title}`);
        } catch (err) {
            console.log('Failed to extract product title:', err.message);
        }

        // Price from multiple fallback selectors (updated with modern Amazon selectors)
        const priceSelectors = [
            '.a-price .a-offscreen', // Current common pattern for Amazon
            '.a-price-whole', // For whole number part
            '.priceToPay .a-offscreen', // Another common pattern
            '#corePrice_feature_div .a-offscreen', // Another price location
            '#priceblock_dealprice',
            '#priceblock_ourprice',
            '#priceblock_saleprice',
            '#price_inside_buybox',
            '.a-text-price .a-offscreen',
            '#tp_price_block_total_price_ww',
            '#newBuyBoxPrice',
            '.apexPriceToPay .a-offscreen', // For Prime deals
            '#sns-base-price', // Subscribe & Save price
        ];

        let foundPrice = false;
        for (const selector of priceSelectors) {
            try {
                const rawPrice = await page.$eval(selector, (el) => el.textContent);
                console.log(`Found raw price with selector ${selector}: "${rawPrice}"`);

                const extractedPrice = extractPrice(rawPrice);
                console.log(`Extracted price: ${extractedPrice}`);

                if (extractedPrice && parseFloat(extractedPrice) > 0) {
                    product.price = extractedPrice;
                    product.rawPrice = rawPrice;
                    foundPrice = true;
                    console.log(`Selected price: ${product.price} from raw: ${rawPrice}`);
                    break;
                }
            } catch (err) {
                // Just continue to next selector
                continue;
            }
        }

        if (!foundPrice) {
            console.log('No price found with standard selectors, trying alternative approaches');

            // Try to find any price-like text on the page as a fallback
            try {
                const priceTexts = await page.$$eval('*', (elements) => {
                    return elements
                        .map((el) => el.textContent)
                        .filter(
                            (text) =>
                                text &&
                                (text.includes('€') ||
                                    text.includes('$') ||
                                    text.includes('£') ||
                                    /\d+[\.,]\d{2}/.test(text))
                        );
                });

                for (const text of priceTexts) {
                    if (/[\$€£]\s*\d+[\.,]\d{2}/.test(text)) {
                        const extractedPrice = extractPrice(text);
                        if (extractedPrice && parseFloat(extractedPrice) > 0) {
                            product.price = extractedPrice;
                            product.rawPrice = text;
                            console.log(`Fallback price found: ${product.price} from: ${text}`);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.log('Fallback price extraction failed:', err.message);
            }
        }

        // Image
        try {
            product.mainImgUrl = await page.$eval('#imgTagWrapperId img, #landingImage', (el) => el.src);
            console.log(`Found image URL: ${product.mainImgUrl}`);
        } catch (err) {
            console.log('Failed to extract image URL:', err.message);
        }

        // Availability
        try {
            product.availability = await page.$eval('#availability span, #deliveryBlockMessage', (el) => {
                const text = el.textContent.trim().toLowerCase();
                return (
                    text.includes('auf lager') ||
                    text.includes('in stock') ||
                    text.includes('available') ||
                    text.includes('derzeit verfügbar') ||
                    text.includes('nur noch') ||
                    (!text.includes('out of stock') && !text.includes('currently unavailable'))
                );
            });
        } catch (err) {
            // Default to true if we can't determine - safer for most use cases
            product.availability = true;
            console.log('Failed to extract availability:', err.message);
        }

        console.log('Final product data:', JSON.stringify(product, null, 2));
    } catch (err) {
        console.error('⚠️ scrapeAmazonProduct failed:', err);
    } finally {
        // Safely close browser if it exists
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.error('Error closing browser:', closeErr);
            }
        }
    }
    console.log('Finished Amazon scraping');

    return product;
}
