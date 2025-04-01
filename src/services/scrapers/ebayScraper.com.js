// import the puppeteer library which provides a high-level API to control Chrome/Chromium
import puppeteer from "puppeteer";

/**
 * function to scrape eBay product listings based on a search query
 * @param {string} query - the search term to look for on eBay
 * @returns {Promise<Array>} - returns a promise that resolves to an array of product objects
 */
const scrapeEbay = async (query) => {
  // launch a new browser instance in headless mode (no visible UI)
  // headless: true means the browser runs in the background without showing a window
  const browser = await puppeteer.launch({ headless: true });

  // create a new browser page/tab
  const page = await browser.newPage();

  // construct the eBay search URL with the encoded query parameter
  // encodeURIComponent ensures special characters in the query are properly URL-encoded
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;

  // navigate to the eBay search results page
  // the 'waitUntil: "networkidle2"' option makes sure the page is considered loaded
  // when there are no more than 2 network connections for at least 500ms
  await page.goto(searchUrl, { waitUntil: "networkidle2" });

  // log the URL being scraped for debugging purposes
  console.log(`scraping eBay: ${searchUrl}`);

  // wait for the product items to appear on the page
  // this ensures we don't try to extract data before the page has loaded
  await page.waitForSelector(".s-item");

  // execute JavaScript code in the context of the web page to extract product information
  // page.evaluate runs the function inside the browser environment
  const results = await page.evaluate(() => {
    // initialize an empty array to store the scraped product data
    const items = [];

    // select all elements with the class "s-item", which are the product listings
    const elements = document.querySelectorAll(".s-item");

    // loop through each product listing
    // limit to the first 3 products that have all required information
    for (let i = 0; i < elements.length && items.length < 3; i++) {
      // get the current product element
      const el = elements[i];

      // extract product details using CSS selectors with optional chaining (?.)
      // optional chaining prevents errors if elements don't exist
      const title = el.querySelector(".s-item__title")?.innerText; // get the product title
      const price = el.querySelector(".s-item__price")?.innerText; // get the product price
      const link = el.querySelector(".s-item__link")?.href; // get the product link

      // only add the product to our results if all required data was found
      if (title && price && link) {
        items.push({
          title, // product title
          price, // product price (as text)
          link, // URL to the product page
          store: "eBay", // indicate this product is from eBay
        });
      }
    }

    // return the array of collected product data
    return items;
  });

  // close the browser to free up system resources
  // this is important to prevent memory leaks
  await browser.close();

  // log how many items were successfully scraped
  console.log(`scraped ${results.length} items:`);

  // log the detailed product information for inspection
  console.log(results);

  // return the array of product objects for further processing
  return results;
};

// execute the scrapeEbay function with "iphone" as the search query
scrapeEbay("iphone")
  // when scraping is complete, log "done"
  .then(() => console.log("done"))
  // if any errors occur during the process, log them to the console
  .catch(console.error);
