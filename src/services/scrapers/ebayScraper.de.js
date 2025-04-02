import puppeteer from 'puppeteer'; // import the puppeteer library which allows us to control a headless browser

/**
 * function to scrape multiple pages of eBay search results
 * this enhanced version includes pagination to scrape multiple pages of results
 *
 * @param {string} query - the search term to look for on eBay
 * @param {number} maxPages - maximum number of pages to scrape (default: 3)
 * @returns {Promise<Array>} - a promise that resolves to an array of all scraped products
 */
const scrapeEbay = async (query, maxPages = 3) => {
    // launch a new browser instance in headless mode (no visible UI)
    // the arguments help prevent permission issues in Docker/CI environments
    // options for browser launch
    // headless: true for production, false for debugging
    // args: ["--no-sandbox", "--disable-setuid-sandbox"] for Linux environments
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // create a new page/tab in the browser where we'll perform our scraping
    const page = await browser.newPage();

    // set a realistic user agent string to look like a normal browser
    // this helps avoid detection by anti-bot measures on websites
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    );

    // initialize pagination variables
    let currentPage = 1; // track which page we're currently on
    let currentUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(query)}`; // start with the first page URL
    const allItems = []; // master array to store all products from all pages

    // main pagination loop - continues until we reach maxPages or there are no more pages
    while (currentPage <= maxPages && currentUrl) {
        // log which page we're currently scraping (helpful for debugging)
        console.log(`scraping eBay page ${currentPage}: ${currentUrl}`);

        // navigate to the current page URL and wait for basic DOM content to load
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });

        // wait until product listings appear before trying to scrape them
        await page.waitForSelector('.s-item');

        // scroll to bottom of page to trigger lazy-loading of images and content
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // allow time (3 seconds) for lazy-loaded elements to fully load
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // execute JavaScript within the browser context to extract data from the current page
        const results = await page.evaluate(() => {
            // initialize array to store products from this page
            const items = [];

            // select all product listings on the page
            const elements = document.querySelectorAll('.s-item');

            // process each product listing to extract details
            for (let el of elements) {
                // extract basic product information using CSS selectors
                // optional chaining (?.) prevents errors if elements don't exist
                const title = el.querySelector('.s-item__title')?.innerText; // product title
                const price = el.querySelector('.s-item__price')?.innerText; // product price
                const link = el.querySelector('.s-item__link')?.href; // product URL
                const shipping = el.querySelector('.s-item__shipping')?.innerText; // shipping info
                const condition = el.querySelector('.SECONDARY_INFO')?.innerText; // condition (new, used)
                const location = el.querySelector('.s-item__location')?.innerText; // seller location

                // image extraction with multiple fallback strategies
                let image = null;

                // try to find the image element with different possible selectors
                const imgEl = el.querySelector('.s-item__image-img') || el.querySelector('.s-item__image img');

                // if image element found, try various attributes that might contain the URL
                if (imgEl) {
                    // try different image source attributes (sites use different ones for lazy loading)
                    image =
                        imgEl.getAttribute('src') || // standard image source
                        imgEl.getAttribute('data-src') || // common lazy-load attribute
                        imgEl.getAttribute('data-img-src') || // alternative lazy-load attribute
                        imgEl.getAttribute('data-image-src'); // another possible attribute

                    // handle placeholder images (1x2.gif) by looking for better images in srcset
                    if (
                        (!image || image.includes('1x2.gif')) && // if no image or it's a placeholder
                        imgEl.hasAttribute('srcset') // and srcset attribute exists
                    ) {
                        // extract the highest resolution image from srcset
                        const srcset = imgEl.getAttribute('srcset');
                        // take the last entry in srcset (typically highest resolution)
                        const best = srcset.split(',').pop()?.trim().split(' ')[0];
                        // use it if it's not a placeholder
                        if (best && !best.includes('1x2.gif')) image = best;
                    }
                }

                // advanced fallback: try to extract image from <noscript> tag
                // some sites hide real images in noscript tags for non-JS browsers
                if (!image) {
                    // look for noscript tag and get its HTML content
                    const noscript = el.querySelector('noscript')?.innerHTML;

                    // if found, use regex to extract image URL from the HTML
                    if (noscript) {
                        const match = noscript.match(/<img.*?src="(.*?)"/i);
                        // use the extracted URL if it's valid and not a placeholder
                        if (match && match[1] && !match[1].includes('1x2.gif')) {
                            image = match[1];
                        }
                    }
                }

                // only include products with essential information (title, price, link)
                if (title && price && link) {
                    // add this product to our results array with all available details
                    items.push({
                        title, // product name
                        price, // price with currency
                        link, // URL to product page
                        image, // image URL (may be null)
                        shipping: shipping || null, // shipping information (may be null)
                        condition: condition || null, // product condition (may be null)
                        location: location || null, // seller location (may be null)
                        store: 'eBay', // source marketplace
                    });
                }
            }

            // return all products found on this page
            return items;
        });

        // log how many items we found on this page
        console.log(`page ${currentPage}: ${results.length} items scraped`);

        // add this page's products to our master list
        allItems.push(...results);

        // look for a "Next Page" link to continue pagination
        const nextPage = await page.evaluate(() => {
            // find the "Next" pagination link
            const next = document.querySelector('a.pagination__next');
            // return its URL if found, otherwise null
            return next?.href || null;
        });

        // if no next page found, exit the loop
        if (!nextPage) break;

        // update the URL for the next iteration to the next page URL
        currentUrl = nextPage;

        // increment page counter for the next iteration
        currentPage++;
    }

    // clean up by closing the browser when finished
    await browser.close();

    // log the total number of products found across all pages
    console.log(`\ntotal scraped items: ${allItems.length}`);

    // return the complete array of all products
    return allItems;
};

// execute the scraper function with search query "iphone" and max 3 pages
scrapeEbay('iphone', 3)
    .then((scrapedData) => {
        // when scraping is complete, display the results
        console.log('\nscraped data:');

        // format and print details for each product
        scrapedData.forEach((item, i) => {
            console.log(`\nitem ${i + 1}`); // item counter
            console.log(`title: ${item.title}`); // product title
            console.log(`price: ${item.price}`); // price
            console.log(`link: ${item.link}`); // URL
            console.log(`image: ${item.image}`); // image URL
            console.log(`condition: ${item.condition}`); // condition
            console.log(`shipping: ${item.shipping}`); // shipping info
            console.log(`location: ${item.location}`); // seller location
            console.log(`store: ${item.store}`); // marketplace source
        });

        // indicate successful completion
        console.log('\ndone');
    })
    // handle and display any errors that occur during scraping
    .catch(console.error);
