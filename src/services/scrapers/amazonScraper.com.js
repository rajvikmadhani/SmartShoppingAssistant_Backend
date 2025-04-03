import puppeteer from "puppeteer"; // import puppeteer library which allows us to control a headless browser

/**
 * function to scrape Amazon search results with pagination support
 * this function navigates through multiple pages of search results and extracts product information
 *
 * @param {string} query - the product to search for on Amazon (e.g., "iphone", "laptop")
 * @param {number} maxPages - maximum number of pages to scrape (default: 3)
 * @returns {Promise<Array>} - array of product objects containing title, price, rating
 */
const scrapeAmazon = async (query, maxPages = 3) => {
  // launch a new instance of Chromium browser in headless mode (no visible UI)
  // headless:true makes the browser run invisibly in the background
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // additional arguments for better stability
  });

  // create a new page (tab) in the browser to work with
  // this is similar to opening a new tab in a regular browser
  const page = await browser.newPage();

  // set a user agent to look more like a regular browser
  // this helps avoid detection as a bot by Amazon's security systems
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // construct the Amazon search URL with the encoded search query
  // encodeURIComponent ensures special characters in the query are properly URL-encoded
  // e.g., "wireless headphones" becomes "wireless%20headphones"
  // using amazon.com instead of amazon.de
  const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

  // variable to track the current page URL we're scraping
  // initially set to the base search URL for the first page
  let currentPageUrl = baseUrl;

  // counter to keep track of which page number we're currently processing
  // starts at 1 for the first page of search results
  let currentPage = 1;

  // array to collect all product results across all pages
  // we'll add items from each page to this array as we go
  const allResults = [];

  // pagination loop - continue until we hit max pages limit or run out of next pages
  // the loop will break early if there's no next page link found
  while (currentPage <= maxPages && currentPageUrl) {
    // print information about which page we're currently scraping
    // helps with monitoring the progress of the scraper
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`);

    // navigate to the current page URL and wait for it to load completely
    // networkidle2 means wait until there are no more than 2 network connections for 500ms
    // this ensures the page has loaded all the important content before we start scraping
    await page.goto(currentPageUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    }); // increased timeout for US site

    // handle the cookie consent popup which may appear on Amazon US (less common than European sites)
    // this try/catch structure attempts to find and click the accept button, but continues if not found
    try {
      // try multiple possible cookie consent selectors that might exist on Amazon.com
      const cookieSelectors = [
        'input[name="accept"]',
        "#sp-cc-accept",
        'button[name="accept"]',
        'input[id="sp-cc-accept"]',
      ];

      // try each selector in sequence
      for (const selector of cookieSelectors) {
        const hasSelector = (await page.$(selector)) !== null;
        if (hasSelector) {
          // click the button if found
          await page.click(selector);
          console.log("accepted cookies");
          await page.waitForTimeout(1000);
          break;
        }
      }
    } catch {
      // if the cookie prompt selector isn't found (timeout or doesn't exist)
      // log that there was no cookie prompt and continue with scraping
      console.log("no cookie prompt");
    }

    // extract product data from the current page
    // page.evaluate executes the provided function in the browser context
    // this allows us to use standard DOM methods to access page elements
    const results = await page.evaluate(() => {
      // create an empty array to store product data from this page
      const items = [];

      // find all product containers on the page using Amazon's CSS class structure
      // s-main-slot contains the main search results
      // s-result-item represents each individual product listing
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        // extract the product title from the h2 heading element
        // ?. is optional chaining which prevents errors if element doesn't exist
        const title = el.querySelector("h2 span")?.innerText;

        // extract the price from a special hidden element containing the price text
        // Amazon uses .a-offscreen to store accessible text versions of visual elements
        const price = el.querySelector(".a-price .a-offscreen")?.innerText;

        // extract the rating text (e.g., "4.5 out of 5 stars")
        // this information is stored in the alt text attribute for accessibility
        const rating = el.querySelector(".a-icon-alt")?.innerText;

        // only add products to our results if they have both a title and price
        // this filters out sponsored content, category headers, and incomplete listings
        if (title && price) {
          // create an object with the product details and add it to our results array
          // each object contains title, price, rating, and store name
          items.push({ title, price, rating, store: "Amazon" });
        }
      });

      // return the complete array of product objects from this page
      return items;
    });

    // log statistics about how many products were found on the current page
    // useful for monitoring scraper performance and debugging
    console.log(`page ${currentPage}: ${results.length} items scraped`);

    // add all products from this page to our master results array
    // the spread operator (...) expands the results array into individual elements
    allResults.push(...results);

    // find the path to the next page by checking for pagination links
    // this code handles both old and new layouts of Amazon's pagination system
    const nextPagePath = await page.evaluate(() => {
      // try the traditional pagination with "ul.a-pagination li.a-last a" selector
      // this was the common structure in older Amazon layouts
      const nextLinkOld = document.querySelector("ul.a-pagination li.a-last a");

      // try the newer pagination with "a.s-pagination-next" selector
      // Amazon has been updating their site to use this simpler structure
      const nextLinkNew = document.querySelector("a.s-pagination-next");

      // get the href attribute from whichever selector worked, or null if neither found
      // we use the || (logical OR) operator to try each option in sequence
      return (
        nextLinkOld?.getAttribute("href") ||
        nextLinkNew?.getAttribute("href") ||
        null
      );
    });

    // if no next page link was found, we've reached the end of results
    // break out of the loop early to avoid unnecessary processing
    if (!nextPagePath) {
      // log that we've reached the end of pagination
      console.log("no next page link found.");
      break;
    }

    // construct the full URL for the next page
    // Amazon pagination links are usually relative paths that need to be combined with the domain
    // using amazon.com instead of amazon.de
    currentPageUrl = `https://www.amazon.com${nextPagePath}`;

    // increment the page counter for the next iteration
    // this tracks which page number we'll be processing next
    currentPage++;
  }

  // clean up resources by closing the browser
  // this is important to prevent memory leaks and hanging processes
  await browser.close();

  // return the full collection of products from all pages
  // this is the final output of our scraping function
  return allResults;
};

// execute the scraper with "iphone" as the search query, limiting to 2 pages
// this demonstrates how to call the function and handle its results
scrapeAmazon("iphone", 2)
  .then((results) => {
    // when scraping is complete, this callback receives the full results array

    // log the total number of products found across all pages
    // \n adds a blank line before this output for readability
    console.log(`\ntotal items scraped: ${results.length}`);

    // log the complete array of product objects to the console
    // this shows all the product information we've collected
    console.log(results);
  })
  // handle any errors that occur during the scraping process
  // errors could be network issues, timeouts, or structural changes to the website
  .catch(console.error);
