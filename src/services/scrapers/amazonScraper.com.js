import puppeteer from "puppeteer"; // import the puppeteer library which provides a high-level API to control Chrome/Chromium

/**
 * function to scrape Amazon search results for a given query
 * @param {string} query - the search term to look up on Amazon
 * @returns {Promise<Array>} - Promise resolving to an array of product data objects
 */
const scrapeAmazon = async (query) => {
  // launch a new browser instance
  // headless:true means the browser runs in the background without a visible UI
  const browser = await puppeteer.launch({ headless: true });

  // create a new page/tab in the browser
  // this is similar to opening a new tab in a regular browser
  const page = await browser.newPage();

  // construct the Amazon search URL with the encoded query parameter
  // encodeURIComponent ensures special characters in the query are properly URL-encoded
  // using Amazon.com (US site)
  const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

  // navigate to the Amazon search results page and wait until the page is fully loaded
  // 'networkidle2' means navigation is considered complete when there are no more than 2 network connections for at least 500ms
  // this is important because Amazon loads content dynamically
  await page.goto(url, { waitUntil: "networkidle2" });

  // execute JavaScript code in the context of the page to extract data
  // everything inside this function runs in the browser's context, not Node.js
  const results = await page.evaluate(() => {
    // create an empty array to store the product results
    const items = [];

    // select all search result items from the page
    // '.s-main-slot .s-result-item' targets the container elements for each product listing
    document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
      // for each product element, extract the following data:

      // extract the product title text from the h2 span element
      // the optional chaining (?.) ensures the code doesn't crash if the element doesn't exist
      const title = el.querySelector("h2 span")?.innerText;

      // extract the price from the hidden offscreen element that contains the full price text
      // amazon uses this element to store the complete price information
      const price = el.querySelector(".a-price .a-offscreen")?.innerText;

      // extract the product rating text (e.g., "4.5 out of 5 stars")
      const rating = el.querySelector(".a-icon-alt")?.innerText;

      // only add items to our results if they have both a title and price
      // this filters out sponsored content or other non-product elements
      if (title && price) {
        // create a product object with the extracted data and push it to our items array
        // 'store: "Amazon"' adds metadata about which store this data came from
        items.push({ title, price, rating, store: "Amazon" });
      }
    });

    // return only the first 3 products from our collected items
    // slice(0, 3) takes elements from index 0 up to (but not including) index 3
    return items.slice(0, 3);
  });

  // close the browser completely to free up system resources
  // this is important to prevent memory leaks
  await browser.close();

  // return the extracted results to the caller of this function
  return results;
};

// example usage: Search for "iphone" on Amazon
// .then(console.log) will print the results to console if successful
// .catch(console.error) will print any errors that occur during scraping
scrapeAmazon("iphone").then(console.log).catch(console.error);
