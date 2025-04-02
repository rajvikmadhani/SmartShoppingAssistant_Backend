import puppeteer from 'puppeteer'; // import puppeteer library which allows us to control a headless browser

/**
 * function to scrape eBay search results with pagination support
 * this function navigates through multiple pages of search results and extracts product information
 *
 * @param {string} query - the product to search for on eBay (e.g., "iphone", "laptop")
 * @param {number} maxPages - maximum number of pages to scrape (default: 3)
 * @returns {Promise<Array>} - array of product objects containing title, price, condition, etc.
 */
const scrapeEbay = async (query, maxPages = 3) => {
    // launch a new instance of Chromium browser in headless mode (no visible UI)
    // headless:true makes the browser run invisibly in the background
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // create a new page (tab) in the browser to work with
    // this is similar to opening a new tab in a regular browser
    const page = await browser.newPage();

    // set a realistic user agent to make our request look like it's coming from a normal browser
    // this helps avoid being blocked by websites that detect automation tools
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    );

    // construct the eBay search URL with the encoded search query
    // encodeURIComponent ensures special characters in the query are properly URL-encoded
    // e.g., "wireless headphones" becomes "wireless%20headphones"
    let currentUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;

    // counter to keep track of which page number we're currently processing
    // starts at 1 for the first page of search results
    let currentPage = 1;

    // array to collect all product results across all pages
    // we'll add items from each page to this array as we go
    const allItems = [];

    // pagination loop - continue until we hit max pages limit or run out of next pages
    // the loop will break early if there's no next page link found
    while (currentPage <= maxPages && currentUrl) {
        // print information about which page we're currently scraping
        // helps with monitoring the progress of the scraper
        console.log(`scraping eBay page ${currentPage}: ${currentUrl}`);

        // navigate to the current page URL and wait for it to load
        // domcontentloaded is faster than networkidle2 and sufficient for eBay
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded' });

        // wait for the product listing elements to appear before proceeding
        // this ensures we don't try to extract data from an incomplete page
        await page.waitForSelector('.s-item');

        // scroll to the bottom of the page to trigger lazy-loading of images
        // many websites only load images when they come into view to save bandwidth
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // give the page some time to load any lazy-loaded content
        // this pause allows images and other dynamic content to appear
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // extract product data from the current page
        // page.evaluate executes the provided function in the browser context
        // this allows us to use standard DOM methods to access page elements
        const results = await page.evaluate(() => {
            // create an empty array to store product data from this page
            const items = [];

            // select all product elements on the page
            // s-item is the class eBay uses for each product listing
            const elements = document.querySelectorAll('.s-item');

            // process each product listing to extract details
            for (let el of elements) {
                // extract various product details using CSS selectors
                // ?. is optional chaining which prevents errors if element doesn't exist
                const title = el.querySelector('.s-item__title')?.innerText; // product title
                const price = el.querySelector('.s-item__price')?.innerText; // product price
                const link = el.querySelector('.s-item__link')?.href; // product URL
                const shipping = el.querySelector('.s-item__shipping')?.innerText; // shipping info
                const condition = el.querySelector('.SECONDARY_INFO')?.innerText; // item condition
                const location = el.querySelector('.s-item__location')?.innerText; // seller location

                // image extraction is more complex due to lazy loading techniques
                let image = null;

                // try to find the image element using different possible selectors
                const imgEl = el.querySelector('.s-item__image-img') || el.querySelector('.s-item__image img');

                // if we found an image element, try various attributes for the URL
                if (imgEl) {
                    image =
                        imgEl.getAttribute('src') || // standard image source
                        imgEl.getAttribute('data-src') || // lazy-load data attribute
                        imgEl.getAttribute('data-img-src') || // alternative lazy-load attribute
                        imgEl.getAttribute('data-image-src'); // another possible attribute

                    // handle placeholder images by looking for better quality in srcset
                    if (
                        (!image || image.includes('1x2.gif')) && // if image is missing or is a placeholder
                        imgEl.hasAttribute('srcset') // and srcset attribute exists
                    ) {
                        // extract the highest resolution image from srcset
                        const srcset = imgEl.getAttribute('srcset');
                        const best = srcset.split(',').pop()?.trim().split(' ')[0];

                        // use it if it's valid and not a placeholder
                        if (best && !best.includes('1x2.gif')) image = best;
                    }
                }

                // try to extract image from noscript tag if still not found
                if (!image) {
                    // check if noscript tag exists within this product element
                    const noscript = el.querySelector('noscript')?.innerHTML;

                    // if found, use regex to extract image URL from HTML inside
                    if (noscript) {
                        const match = noscript.match(/<img.*?src="(.*?)"/i);

                        // if match found and it's not a placeholder, use this image
                        if (match && match[1] && !match[1].includes('1x2.gif')) {
                            image = match[1];
                        }
                    }
                }

                // only include products with essential information (title, price, link)
                if (title && price && link) {
                    // add this product with all its details to our results array
                    items.push({
                        title, // product name/title
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

            // return the array of product objects from this page
            return items;
        });

        // log statistics about how many products were found on the current page
        console.log(`page ${currentPage}: ${results.length} items scraped`);

        // add all products from this page to our master array
        allItems.push(...results);

        // find the next page URL by checking for pagination links
        // this looks for eBay's specific pagination navigation elements
        const nextPage = await page.evaluate(() => {
            // find the "Next" pagination link
            const next = document.querySelector('a.pagination__next');
            // return its URL if found, otherwise null
            return next?.href || null;
        });

        // if no next page link was found, we've reached the end of results
        if (!nextPage) {
            console.log('no next page link found.');
            break;
        }

        // update the URL for the next iteration to the next page URL
        currentUrl = nextPage;

        // increment the page counter for the next iteration
        currentPage++;
    }

    // clean up resources by closing the browser
    await browser.close();

    // log the total number of products found across all pages
    console.log(`\ntotal scraped items: ${allItems.length}`);

    // return the complete collection of products from all pages
    return allItems;
};
/*
// execute the scraper with "iphone" as the search query, limiting to 3 pages
scrapeEbay("iphone", 3)
  .then((scrapedData) => {
    // when scraping is complete, format and display the results
    console.log("\nscraped data:");

    // format and print details for each product
    scrapedData.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`); // item number for readability
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
    console.log("\ndone");
  })
  // handle any errors that occur during the scraping process
  .catch(console.error);
  */
export default scrapeEbay; // export the scrapeEbay function for use in other modules
