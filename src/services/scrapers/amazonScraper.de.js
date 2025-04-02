import puppeteer from "puppeteer"; // import Puppeteer library to control headless Chrome/Chromium

/**
 * function to scrape multiple pages of Amazon search results
 * @param {string} query - the search term to look up on Amazon
 * @param {number} maxPages - maximum number of pages to scrape (defaults to 3)
 * @returns {Promise<Array>} - Promise resolving to an array of product data objects from all pages
 */
const scrapeAmazon = async (query, maxPages = 3) => {
  const browser = await puppeteer.launch({ headless: true }); // launch a headless browser instance (runs invisibly)
  const page = await browser.newPage(); // create a new browser tab/page

  // construct the Amazon search URL with URL-encoded query parameter
  const baseUrl = `https://www.amazon.de/s?k=${encodeURIComponent(query)}`;
  let currentPageUrl = baseUrl; // track the current page URL, starting with the base search URL
  let currentPage = 1; // initialize page counter to track which page we're on
  const allResults = []; // initialize empty array to store all collected product data

  // begin pagination loop - continue until we reach maxPages or there are no more pages
  while (currentPage <= maxPages && currentPageUrl) {
    // log which page we're currently scraping for debugging/tracking
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`);

    // navigate to the current page URL and wait for the page to load
    // 'networkidle2' waits until the page has no more than 2 network connections for at least 500ms
    await page.goto(currentPageUrl, { waitUntil: "networkidle2" });

    // handle cookie consent popup if it appears (common on European Amazon sites)
    try {
      // wait for the cookie consent button to appear, with a short timeout
      // timeout of 3000ms (3 seconds) to avoid hanging indefinitely
      await page.waitForSelector('input[name="accept"]', { timeout: 3000 });
      // click the accept cookies button
      await page.click('input[name="accept"]');
      // log that cookies were accepted for debugging
      console.log("accepted cookies");
      // brief pause to ensure the page updates after accepting cookies
      await page.waitForTimeout(1000);
    } catch {
      // if no cookie prompt appears (timeout exceeded), continue without accepting
      console.log("no cookie prompt");
    }

    // execute code within the browser context to extract product data
    const results = await page.evaluate(() => {
      // initialize array to hold product data from this page
      const items = [];

      // select all product containers on the page
      // each product on Amazon search results is in an element with these classes
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        // extract product details from each container
        // optional chaining (?.) prevents errors if elements don't exist
        const title = el.querySelector("h2 span")?.innerText; // Product title text
        const price = el.querySelector(".a-price .a-offscreen")?.innerText; // Product price
        const rating = el.querySelector(".a-icon-alt")?.innerText; // Star rating text

        // only include products that have both title and price
        // this filters out sponsored items, category headers, etc.
        if (title && price) {
          items.push({ title, price, rating, store: "Amazon" });
        }
      });
      // return all products found on this page
      return items;
    });

    // log how many products were found on the current page
    console.log(`page ${currentPage}: ${results.length} items scraped`);
    allResults.push(...results); // add this page's results to our master array using spread operator

    // find the URL for the next page, if it exists
    const nextUrl = await page.evaluate(() => {
      // amazon's pagination has a "Next" button inside a list item with class "a-last"
      const nextLink = document.querySelector("ul.a-pagination li.a-last a");
      // return the URL of the next page, or null if there isn't one
      return nextLink ? nextLink.href : null;
    });

    // if there's no next page link, exit the loop early
    if (!nextUrl) break;

    // update tracking variables for the next iteration
    currentPageUrl = nextUrl; // Set the next page URL
    currentPage++; // Increment the page counter
  }

  // clean up resources by closing the browser
  await browser.close();
  // return the complete collection of results from all pages
  return allResults;
};

// execute the scraper function with "iphone" as the search term, scraping up to 3 pages
scrapeAmazon("iphone", 3)
  .then((results) => {
    // when scraping is complete, log the total number of products found
    console.log(`\ntotal items scraped: ${results.length}`);
    // log the complete array of product data
    console.log(results);
  })
  // handle and log any errors that occur during scraping
  .catch(console.error);
