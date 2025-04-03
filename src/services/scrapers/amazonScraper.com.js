import puppeteer from "puppeteer"; // import puppeteer library to control a headless Chrome browser

/**
 * function to scrape Amazon search results with automatic pagination
 * this function will continue scraping until there are no more result pages
 *
 * @param {string} query - the search term to look up on Amazon
 * @returns {Promise<Array>} - Promise resolving to an array of product data
 */
const scrapeAmazon = async (query) => {
  // initialize a new headless browser instance
  // headless:true means the browser runs in the background without visible UI
  const browser = await puppeteer.launch({ headless: true });

  // create a new page/tab in the browser for navigation
  // similar to opening a new tab in a regular browser
  const page = await browser.newPage();

  // construct the Amazon search URL with the query parameter properly encoded
  // encodeURIComponent ensures special characters in the search term are properly handled
  const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

  // track the current page URL we're scraping, starting with the base search URL
  // this variable will be updated as we navigate through pagination
  let currentPageUrl = baseUrl;

  // initialize page counter to track which page number we're currently on
  // useful for logging and understanding where we are in the pagination sequence
  let currentPage = 1;

  // initialize an empty array to collect all products from all pages
  // we'll continuously add to this as we scrape each page
  const allResults = [];

  // begin the pagination loop - continue until there are no more pages (currentPageUrl becomes null)
  // unlike the previous example, this loop doesn't have a maximum page limit
  while (currentPageUrl) {
    // log which page we're currently scraping for tracking/debugging
    // displays the page number and full URL being accessed
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`);

    // navigate to the current search results page and wait until it loads completely
    // networkidle2 means wait until there are no more than 2 network connections for at least 500ms
    // this ensures the dynamic content has fully loaded before scraping
    await page.goto(currentPageUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // handle the cookie consent popup if it appears (less common on Amazon.com but included for robustness)
    // wrapped in try/catch to continue scraping even if cookie handling fails
    try {
      // wait up to 1000ms for the cookie acceptance button to appear
      // Amazon.com uses different selectors than Amazon.de
      await page.waitForSelector(
        '#sp-cc-accept, input[name="accept"], button[name="accept"]',
        { timeout: 1000 }
      );

      // click the accept cookies button to dismiss the popup
      // this ensures we can access the full page content
      await page.click(
        '#sp-cc-accept, input[name="accept"], button[name="accept"]'
      );

      // log that cookies were accepted for debugging purposes
      console.log("accepted cookies");

      // brief pause after accepting cookies to allow the page to update
      // gives time for the cookie banner to disappear and content to be visible
      await page.waitForTimeout(1000);
    } catch {
      // if no cookie prompt appears or we time out waiting for it
      // we simply continue with the scraping process
      console.log("no cookie prompt");
    }

    // Wait until product container appears to avoid scraping empty page
    try {
      await page.waitForSelector(".s-main-slot .s-result-item", {
        timeout: 10000,
      });
    } catch {
      console.warn("no product results loaded (maybe blocked). Exiting.");
      break;
    }

    // extract product data from the current page using browser-context JavaScript
    // page.evaluate runs the provided function in the browser's context, not Node.js
    const results = await page.evaluate(() => {
      // create an empty array to store product data from this page
      const items = [];

      // select all product containers on the page using Amazon's HTML structure
      // each product is contained in an element matching these selectors
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        // extract key product information using CSS selectors
        // optional chaining (?.) prevents errors if elements don't exist

        // extract the product title from the h2 heading
        const title = el.querySelector("h2 span")?.innerText;

        // extract the price from the hidden accessible text element
        const price = el.querySelector(".a-price .a-offscreen")?.innerText;

        // extract the product rating text (e.g. "4.5 out of 5 stars")
        const rating = el.querySelector(".a-icon-alt")?.innerText;

        // extract the product image URL from the image element
        const image = el.querySelector(".s-image")?.src;

        // extract the seller name from the secondary text element
        const seller = el.querySelector(
          ".a-row.a-size-base.a-color-secondary"
        )?.innerText;

        // extract the badge text (e.g. "Best Seller", "Amazon's Choice")
        const badge = el.querySelector(".s-badge-text")?.innerText;

        // check if the product is marked as Prime eligible
        const isPrime = !!el.querySelector(".a-icon-prime");

        // extract the delivery information from the text element
        const delivery = el.querySelector(
          ".a-color-base.a-text-bold"
        )?.innerText;

        // extract the ASIN (Amazon Standard Identification Number) from the data attribute
        // this is a unique identifier for each product on Amazon
        // used for creating direct links to product pages
        // the ASIN is stored in a data attribute on the product element
        const asin = el.getAttribute("data-asin"); // get ASIN

        // construct the product detail page link using the ASIN
        // this link directs to the product's page on Amazon for more details
        const link = asin ? `https://www.amazon.com/dp/${asin}` : undefined;

        // extract the product seller rating from the alt text of the icon
        // this typically indicates the average rating given by customers
        const productSellerRate = el.querySelector(".a-icon-alt")?.innerText; // extract the product seller rate

        // only add items that have both a title and price to filter out
        // non-product elements like sponsored links, category headers, etc.
        if (title && price) {
          // create a product object and add it to our results array
          items.push({
            title,
            price,
            rating,
            link,
            image,
            seller,
            productSellerRate,
            badge,
            isPrime,
            delivery,
            store: "Amazon",
          });
        }
      });
      return items; // return the complete array of products back to Node.js context
    });

    // log statistics about how many products were found on this page
    // useful for monitoring the scraper's effectiveness
    console.log(`page ${currentPage}: ${results.length} items scraped`);

    // add products from this page to our master results array
    // spread operator (...) unpacks the array into individual elements
    allResults.push(...results);

    // determine if there's a next page by looking for pagination controls
    // handles both old and new Amazon page layouts for better compatibility
    const nextPagePath = await page.evaluate(() => {
      // try to find the next page link in the traditional pagination controls
      // these typically appear as a numbered list at the bottom of search results
      const nextOld = document.querySelector("ul.a-pagination li.a-last a");

      // try to find the next page link in the newer pagination layout
      // Amazon has been transitioning to this simplified design
      const nextNew = document.querySelector("a.s-pagination-next");

      // return the href attribute from whichever selector worked, or null if neither found
      // logical OR operator (||) tries each option in sequence
      return (
        nextOld?.getAttribute("href") || nextNew?.getAttribute("href") || null
      );
    });

    // if no next page link was found, we've reached the end of results
    // exit the loop as there are no more pages to scrape
    if (!nextPagePath) {
      // log that we've reached the end of pagination
      console.log("no more pages found.");
      break;
    }

    // construct the full URL for the next page by combining the domain with the path
    // Amazon pagination links are typically relative URLs that need the domain prepended
    currentPageUrl = `https://www.amazon.com${nextPagePath}`;

    // increment the page counter for the next iteration
    // keeps track of which page number we'll be processing next
    currentPage++;
  }

  // clean up resources by closing the browser instance
  // important to prevent memory leaks and orphaned processes
  await browser.close();

  // return the complete collection of products from all pages
  // this contains all the product data we've scraped
  return allResults;
};

// execute the scraper function with "iphone" as the search query
// no page limit is specified, so it will scrape all available pages
scrapeAmazon("iphone")
  // handle the successful completion of scraping
  .then((results) => {
    // log the total number of products found across all pages
    // \n adds a blank line before this output for better readability
    console.log(`\ntotal items scraped: ${results.length}`);

    // log the complete dataset of all products scraped
    // displays all product information collected during the scraping process
    console.log(results);
  })
  // handle any errors that occurred during scraping
  // ensures failures are properly logged rather than crashing the application
  .catch(console.error);
