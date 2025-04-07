/***************************
 * this script is a web scraper for Back Market
 * it uses puppeteer-extra with the stealth plugin to avoid bot detection
 * and scrape product data from the site
 * the scraper is designed to handle dynamic content and lazy loading
 * it extracts product details like title, price, image, and specifications
 * the script includes error handling and logging for debugging purposes
 * the example function demonstrates how to use the scraper
 * and prints the results in a structured format
 *
 * 93 items scraped from 3 pages
 * 3 pages of products with detailed information
 ***************************/

// import puppeteer-extra instead of regular puppeteer to enable plugins
// puppeteer-extra extends functionality of the standard puppeteer package
import puppeteer from "puppeteer-extra";
// import the Stealth plugin which helps avoid bot detection by websites
// this plugin applies various techniques to make the browser appear more like a real user
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// apply the Stealth plugin to puppeteer to avoid bot detection
// this adds multiple evasion techniques: webdriver hiding, chrome app simulation, etc.
puppeteer.use(StealthPlugin());

// helper function to pause execution for a specified time
// this is crucial for web scraping to avoid overwhelming the server with requests
// also gives time for dynamic content to load properly
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// function to scroll to the bottom of the page to load lazy-loaded content
// this means we need to scroll down to trigger the loading of products further down the page
async function autoScroll(page) {
  // execute JavaScript in the context of the web page
  // this is how puppeteer runs code directly in the browser environment
  await page.evaluate(async () => {
    // return a promise that resolves when scrolling is complete
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // scroll 100px at a time - smaller values are more natural
      const timer = setInterval(() => {
        // get the total scrollable height of the page
        const scrollHeight = document.body.scrollHeight;
        // scroll down by the specified distance
        window.scrollBy(0, distance);
        totalHeight += distance;

        // if we've scrolled to the bottom of the page, stop scrolling
        // this indicates we've triggered all lazy-loading elements
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); // scroll every 100ms - this simulates natural scrolling behavior
    });
  });
}

/**
 * scraper function for Back Market
 * this function handles all the logic for searching products and extracting their data
 *
 * @param {Object} productQuery - search parameters for finding products
 * @param {string} backMarketDomain - which Back Market domain to use (defaults to US)
 * @param {number} pagesToScrape - how many pages to scrape (updated default to 3)
 * @returns {Array} - collection of all product objects with their details
 */
export const backMarketScraper = async (
  productQuery,
  backMarketDomain = "backmarket.com",
  pagesToScrape = 3 // UPDATED: default to scraping 3 pages instead of 2
) => {
  // extract individual search parameters from the query object
  // this allows flexible searching by different product attributes
  const { brand, name, storage_gb, ram_gb, color } = productQuery;

  // construct the search query string from the provided parameters
  // format is "Brand Name StorageGB RAMgb Color"
  // the || "" ensures we don't add "undefined" to the query if a parameter is missing
  const queryString = `${brand} ${name} ${storage_gb || ""}GB ${
    ram_gb || ""
  }GB ${color || ""}`.trim();
  // URL encoding ensures special characters don't break the URL
  // for example, spaces become %20
  const encodedQuery = encodeURIComponent(queryString);
  // build the full search URL with domain and query parameters
  const baseUrl = `https://${backMarketDomain}/en-us/search?q=${encodedQuery}`;

  // launch the browser with stealth mode to avoid detection
  // "headless: new" means the browser runs invisibly (no GUI window)
  // the arguments improve stability in different environments
  const browser = await puppeteer.launch({
    headless: "new", // use new headless mode for better performance
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // security flags for running in various environments
  });

  // open a new page in the browser - this is like opening a new tab
  const page = await browser.newPage();
  // set a realistic user agent to further avoid bot detection
  // user agents identify the browser and OS to the website
  // a modern Chrome user agent reduces suspicion of automation
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // initialize array to store all products from all pages we scrape
  let allResults = [];
  // track which page number we're currently on for pagination
  let currentPage = 1;

  // log which page we're starting with and the URL
  // this helps with debugging if something goes wrong
  console.log(`scraping page ${currentPage} from ${baseUrl}`);

  // navigate to the search URL and wait for the DOM content to load
  // the timeout of 60000ms (60 seconds) gives ample time for slow connections
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  // wait 5 seconds for dynamic content like JavaScript-loaded products to appear
  // back Market uses React/JS frameworks that need time to render content
  await sleep(5000);

  // ==============================================================
  // page 1 scraping
  // ==============================================================

  // scroll to load all products on the current page
  // this triggers lazy loading of product images and data
  await autoScroll(page);
  // wait for content to stabilize after scrolling
  // without this, we might try to extract data while products are still loading
  await sleep(1500);

  try {
    // wait for product cards to appear on the page before proceeding
    // data-qa attributes are used by Back Market for their UI components
    // these are more stable selectors than classes which might change often
    await page.waitForSelector('div[data-qa="productCard"]', {
      timeout: 10000, // wait up to 10 seconds for products to appear
    });

    // extract product data from the page using evaluate
    // page.evaluate runs the code inside the browser context
    // this lets us use standard DOM methods to extract data
    const results = await page.evaluate(() => {
      const items = []; // Array to collect product data
      // get all product cards on the page using the data-qa selector
      const cards = document.querySelectorAll('div[data-qa="productCard"]');

      // process each product card to extract all needed information
      for (const card of cards) {
        // extract product title - use innerText to get only visible text
        // the ?. operator (optional chaining) prevents errors if the element doesn't exist
        const title = card.querySelector("h2 a span")?.innerText?.trim();

        // extract current price - using data-qa attributes for reliable selection
        const price = card
          .querySelector('[data-qa="productCardPrice"]')
          ?.innerText?.trim();

        // extract original price (if on sale) - this shows the before-discount price
        const originalPrice =
          card
            .querySelector('[data-qa="productCardOriginalPrice"]')
            ?.innerText?.trim() || null;

        // extract product URL/link - we look for anchor tags with specific URL patterns
        // Back Market product URLs start with /en-us/p/
        const aTag = card.querySelector('h2 a[href^="/en-us/p/"]');
        const href = aTag?.getAttribute("href");
        // build the complete URL by adding the domain to the relative path
        const link = href ? `https://www.backmarket.com${href}` : null;

        // extract product image URL - initialize as null in case we don't find one
        let image = null;
        const img = card.querySelector("img");

        if (img) {
          // try to get the highest quality image from srcset or src attributes
          // srcset contains multiple image resolutions for different screen sizes
          const srcset = img.getAttribute("srcset");
          const rawSrc = img.getAttribute("src");

          // helper function to extract clean image URL from potentially encoded values
          const extractImageURL = (val) => {
            if (!val) return null;
            // decode URL-encoded characters
            const decoded = decodeURIComponent(val);
            // use regex to find the first URL in the string
            const match = decoded.match(/https:\/\/[^ ]+/);
            return match ? match[0] : null;
          };

          // first try srcset (which has multiple image resolutions)
          if (srcset) {
            // parse the srcset format: "url1 1x, url2 2x, url3 3x"
            // split by commas to get each resolution option
            const srcs = srcset.split(",").map((s) => s.trim().split(" ")[0]);
            // get highest resolution (last in the array)
            const highRes = srcs[srcs.length - 1];
            image = extractImageURL(highRes);
          }

          // fall back to src if srcset doesn't provide a usable URL
          // this ensures we get an image even if srcset is not available
          if (!image && rawSrc) {
            image = extractImageURL(rawSrc);
          }
        }

        // extract product rating - reviews are valuable information for buyers
        // use "No rating" as default if no rating is found
        const rating =
          card
            .querySelector('[data-spec="rating"] span.caption-bold')
            ?.innerText?.trim() || "No rating";

        // extract product specifications - these are shown as list items
        // convert NodeList to Array to use array methods like map and find
        const specs = Array.from(
          card.querySelectorAll('[data-test="productspecs"] li')
        ).map((li) => li.textContent.trim());

        // find storage specification from list of specs
        // look for GB, TB or "Storage" keywords to identify storage info
        const storage =
          specs.find(
            (spec) =>
              spec.includes("GB") ||
              spec.includes("TB") ||
              spec.includes("Storage")
          ) || null;

        // calculate discount percentage if original price is available
        // this helps shoppers see how good the deal is
        let discount = null;
        if (price && originalPrice) {
          // extract numeric values from price strings
          // remove currency symbols and non-numeric chars
          const priceValue = parseFloat(price.replace(/[^0-9.]/g, ""));
          const originalPriceValue = parseFloat(
            originalPrice.replace(/[^0-9.]/g, "")
          );

          // calculate percentage only if we have valid numbers
          // the formula is: ((original - current) / original) * 100
          if (
            !isNaN(priceValue) &&
            !isNaN(originalPriceValue) &&
            originalPriceValue > 0
          ) {
            discount = Math.round(
              ((originalPriceValue - priceValue) / originalPriceValue) * 100
            );
          }
        }

        // only add products that have the essential details
        // this avoids cluttering results with incomplete data
        // we require at minimum a title, price and link to be useful
        if (title && price && link) {
          items.push({
            title,
            price,
            originalPrice,
            discount,
            image,
            link,
            rating,
            storage,
            store: `Back Market`,
          });
        }
      }

      return items; // return the collected product data
    });

    // log the number of products found on this page for monitoring
    console.log(`page ${currentPage}: ${results.length} items scraped`);

    // add these first-page products to our overall results array
    // the spread operator (...) unpacks the array into individual items
    allResults.push(...results);

    // ==============================================================
    // page 2 scraping
    // ==============================================================

    // check if we should scrape more pages (based on pagesToScrape parameter)
    if (currentPage < pagesToScrape) {
      console.log("navigating to page 2..."); // log that we're moving to page 2

      // directly construct the URL for page 2 by adding &page=2 parameter
      // this approach is more reliable than clicking navigation buttons
      const page2Url = `${baseUrl}&page=2`;
      console.log(`going to ${page2Url}`); // log the URL for debugging

      // navigate to page 2 and wait for it to load
      await page.goto(page2Url, {
        waitUntil: "domcontentloaded", // wait for DOM content to be ready
        timeout: 60000, // allow up to 60 seconds for the page to load
      });
      await sleep(5000); // wait additional time for JavaScript to initialize components

      // verify we're on page 2 by logging the current URL
      const currentUrl = page.url();
      console.log(`now on URL: ${currentUrl}`);

      // increment page counter to track that we're now on page 2
      currentPage++;

      // scroll to load all products on page 2, just like we did for page 1
      await autoScroll(page);
      await sleep(1500); // wait for content to stabilize

      // wait for product cards to appear on page 2
      await page.waitForSelector('div[data-qa="productCard"]', {
        timeout: 10000,
      });

      const page2Results = await page.evaluate(() => {
        const items = [];
        const cards = document.querySelectorAll('div[data-qa="productCard"]');

        for (const card of cards) {
          const title = card.querySelector("h2 a span")?.innerText?.trim();
          const price = card
            .querySelector('[data-qa="productCardPrice"]')
            ?.innerText?.trim();
          const originalPrice =
            card
              .querySelector('[data-qa="productCardOriginalPrice"]')
              ?.innerText?.trim() || null;

          const aTag = card.querySelector('h2 a[href^="/en-us/p/"]');
          const href = aTag?.getAttribute("href");
          const link = href ? `https://www.backmarket.com${href}` : null;

          let image = null;
          const img = card.querySelector("img");

          if (img) {
            const srcset = img.getAttribute("srcset");
            const rawSrc = img.getAttribute("src");

            const extractImageURL = (val) => {
              if (!val) return null;
              const decoded = decodeURIComponent(val);
              const match = decoded.match(/https:\/\/[^ ]+/);
              return match ? match[0] : null;
            };

            if (srcset) {
              const srcs = srcset.split(",").map((s) => s.trim().split(" ")[0]);
              const highRes = srcs[srcs.length - 1];
              image = extractImageURL(highRes);
            }

            if (!image && rawSrc) {
              image = extractImageURL(rawSrc);
            }
          }

          const rating =
            card
              .querySelector('[data-spec="rating"] span.caption-bold')
              ?.innerText?.trim() || "No rating";

          const specs = Array.from(
            card.querySelectorAll('[data-test="productspecs"] li')
          ).map((li) => li.textContent.trim());

          const storage =
            specs.find(
              (spec) =>
                spec.includes("GB") ||
                spec.includes("TB") ||
                spec.includes("Storage")
            ) || null;

          let discount = null;
          if (price && originalPrice) {
            const priceValue = parseFloat(price.replace(/[^0-9.]/g, ""));
            const originalPriceValue = parseFloat(
              originalPrice.replace(/[^0-9.]/g, "")
            );
            if (
              !isNaN(priceValue) &&
              !isNaN(originalPriceValue) &&
              originalPriceValue > 0
            ) {
              discount = Math.round(
                ((originalPriceValue - priceValue) / originalPriceValue) * 100
              );
            }
          }

          if (title && price && link) {
            items.push({
              title,
              price,
              originalPrice,
              discount,
              image,
              link,
              rating,
              storage,
              store: `Back Market`,
            });
          }
        }

        return items;
      });

      // log how many products were found on page 2
      console.log(`page ${currentPage}: ${page2Results.length} items scraped`);

      // add page 2 results to our overall results array
      allResults.push(...page2Results);

      // ==============================================================
      // page 3 scraping
      // ==============================================================

      if (currentPage < pagesToScrape) {
        console.log("navigating to page 3..."); // log that we're moving to page 3

        // construct the URL for page 3 using the same pattern
        const page3Url = `${baseUrl}&page=3`;
        console.log(`going to ${page3Url}`);

        // navigate to page 3 using the same approach as page 2
        await page.goto(page3Url, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await sleep(5000); // wait for page to load fully

        // verify we're on page 3
        const currentUrl = page.url();
        console.log(`now on URL: ${currentUrl}`);

        // increment page counter to track that we're now on page 3
        currentPage++;

        // scroll to load all products on page 3
        await autoScroll(page);
        await sleep(1500);

        // wait for product cards to appear on page 3
        await page.waitForSelector('div[data-qa="productCard"]', {
          timeout: 10000,
        });

        // extract product data from page 3 using the same technique
        const page3Results = await page.evaluate(() => {
          const items = [];
          const cards = document.querySelectorAll('div[data-qa="productCard"]');

          // extract products using the same logic as previous pages
          for (const card of cards) {
            const title = card.querySelector("h2 a span")?.innerText?.trim();
            const price = card
              .querySelector('[data-qa="productCardPrice"]')
              ?.innerText?.trim();
            const originalPrice =
              card
                .querySelector('[data-qa="productCardOriginalPrice"]')
                ?.innerText?.trim() || null;

            const aTag = card.querySelector('h2 a[href^="/en-us/p/"]');
            const href = aTag?.getAttribute("href");
            const link = href ? `https://www.backmarket.com${href}` : null;

            let image = null;
            const img = card.querySelector("img");

            if (img) {
              const srcset = img.getAttribute("srcset");
              const rawSrc = img.getAttribute("src");

              const extractImageURL = (val) => {
                if (!val) return null;
                const decoded = decodeURIComponent(val);
                const match = decoded.match(/https:\/\/[^ ]+/);
                return match ? match[0] : null;
              };

              if (srcset) {
                const srcs = srcset
                  .split(",")
                  .map((s) => s.trim().split(" ")[0]);
                const highRes = srcs[srcs.length - 1];
                image = extractImageURL(highRes);
              }

              if (!image && rawSrc) {
                image = extractImageURL(rawSrc);
              }
            }

            const rating =
              card
                .querySelector('[data-spec="rating"] span.caption-bold')
                ?.innerText?.trim() || "No rating";

            const specs = Array.from(
              card.querySelectorAll('[data-test="productspecs"] li')
            ).map((li) => li.textContent.trim());

            const storage =
              specs.find(
                (spec) =>
                  spec.includes("GB") ||
                  spec.includes("TB") ||
                  spec.includes("Storage")
              ) || null;

            let discount = null;
            if (price && originalPrice) {
              const priceValue = parseFloat(price.replace(/[^0-9.]/g, ""));
              const originalPriceValue = parseFloat(
                originalPrice.replace(/[^0-9.]/g, "")
              );
              if (
                !isNaN(priceValue) &&
                !isNaN(originalPriceValue) &&
                originalPriceValue > 0
              ) {
                discount = Math.round(
                  ((originalPriceValue - priceValue) / originalPriceValue) * 100
                );
              }
            }

            if (title && price && link) {
              items.push({
                title,
                price,
                originalPrice,
                discount,
                image,
                link,
                rating,
                storage,
                store: `Back Market`,
              });
            }
          }

          return items;
        });

        // log how many products were found on page 3
        console.log(
          `page ${currentPage}: ${page3Results.length} items scraped`
        );

        // add page 3 results to our overall results array
        allResults.push(...page3Results);
      }
      // end of page 3 scraping
      // ==============================================================
    }
  } catch (error) {
    // log any errors that occurred during scraping
    console.error(`Error during scraping:`, error.message);
  }

  // close the browser to free resources
  await browser.close();

  // return all collected products from all pages
  return allResults;
};

/**
 * example function demonstrating how to use the scraper
 */
const exampleUsage = async () => {
  // example product search criteria
  const productQuery = {
    brand: "Apple", // brand name
    name: "iPhone", // product model/name
    storage_gb: "128", // storage capacity
    ram_gb: "", // RAM amount (left empty for iPhones)
    color: "white", // color preference
  };

  // run the scraper with the example query
  // the default is now 3 pages, but you could also explicitly set it:
  // const products = await backMarketScraper(productQuery, "backmarket.com", 3);
  const products = await backMarketScraper(productQuery);

  // log the total number of products found across all pages
  console.log(`\ntotal products scraped: ${products.length}`);

  // print details of each product found
  products.forEach((product, index) => {
    console.log(`\nproduct ${index + 1} :`);
    console.log(`title      : ${product.title}`);
    console.log(`price      : ${product.price}`);
    console.log(`original   : ${product.originalPrice}`);
    console.log(`discount   : ${product.discount}%`);
    console.log(`image      : ${product.image}`);
    console.log(`link       : ${product.link}`);
    console.log(`rating     : ${product.rating}`);
    console.log(`storage    : ${product.storage}`);
    console.log(`store      : ${product.store}`);
  });
};

// execute the example function to start the scraping process
exampleUsage();
