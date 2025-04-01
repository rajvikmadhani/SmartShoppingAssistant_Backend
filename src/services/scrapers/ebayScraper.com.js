import puppeteer from "puppeteer"; // import the puppeteer library for browser automation

/**
 * function to scrape eBay search results for products based on a query
 * this function handles the entire scraping process from launching a browser to returning data
 *
 * @param {string} query - the search keyword to look for on eBay (e.g., "iphone", "laptop", etc.)
 * @returns {Promise<Array>} - a promise that resolves to an array of product objects with details
 */
const scrapeEbay = async (query) => {
  // browser launch configuration
  // headless: true means the browser won't show a UI (runs in background)
  // the no-sandbox and disable-setuid-sandbox flags help run in restricted environments like Docker
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // create a new browser page/tab where we'll perform our scraping
  const page = await browser.newPage();

  // set a realistic user agent to make our request look like it's coming from a normal browser
  // this helps avoid being blocked by websites that detect automation tools
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
  );

  // construct the eBay search URL with our query parameter
  // encodeURIComponent ensures special characters in the query are properly URL-encoded
  // for example, "iPhone 13" becomes "iPhone%2013"
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;

  // log the URL we're about to visit (helpful for debugging)
  console.log(`scraping eBay: ${searchUrl}`);

  // navigate to the search results page and wait until the DOM content is loaded
  // the "domcontentloaded" option is faster than waiting for all resources like images
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  // wait for the product listing elements to appear before proceeding
  // this selector ".s-item" targets the container elements for each product on eBay
  await page.waitForSelector(".s-item");

  // scroll to the bottom of the page to trigger lazy-loading of images and content
  // many websites only load images when they come into view to save bandwidth
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // give the page some time (3 seconds) to load any lazy-loaded content
  // this is a simple delay to ensure images and additional content have time to load
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // execute JavaScript within the context of the webpage to extract product data
  // this runs in the browser environment with direct access to the DOM
  const results = await page.evaluate(() => {
    // initialize an empty array to store our scraped products
    const items = [];

    // select all product elements on the page
    const elements = document.querySelectorAll(".s-item");

    // iterate through each product element to extract its details
    for (let i = 0; i < elements.length; i++) {
      // get the current product element we're processing
      const el = elements[i];

      // extract various product details using CSS selectors
      // the optional chaining operator (?.) prevents errors if an element doesn't exist
      const title = el.querySelector(".s-item__title")?.innerText; // product title text
      const price = el.querySelector(".s-item__price")?.innerText; // product price text
      const link = el.querySelector(".s-item__link")?.href; // product page URL
      const shipping = el.querySelector(".s-item__shipping")?.innerText; // shipping information
      const condition = el.querySelector(".SECONDARY_INFO")?.innerText; // product condition (new, used, etc.)
      const location = el.querySelector(".s-item__location")?.innerText; // seller location

      // image extraction is more complex due to lazy loading techniques on eBay
      let image = null;

      // try to find the image element using different possible selectors
      const imgEl =
        el.querySelector(".s-item__image-img") ||
        el.querySelector(".s-item__image img");

      // if we found an image element, try various attributes that might contain the image URL
      if (imgEl) {
        image =
          imgEl.getAttribute("src") || // standard image source
          imgEl.getAttribute("data-src") || // lazy-load data attribute
          imgEl.getAttribute("data-img-src") || // alternative lazy-load attribute
          imgEl.getAttribute("data-image-src"); // another possible attribute

        // if we couldn't find an image or the image is a placeholder (1x2.gif)
        // try to get a higher resolution image from the srcset attribute
        if (
          (!image || image.includes("1x2.gif")) && // check if image is missing or is a placeholder
          imgEl.hasAttribute("srcset") // check if srcset attribute exists (contains multiple image resolutions)
        ) {
          // get the srcset attribute which contains multiple image URLs with resolutions
          const srcset = imgEl.getAttribute("srcset");

          // get the highest resolution image (usually the last one in the srcset)
          const best = srcset.split(",").pop()?.trim().split(" ")[0];

          // use this image if it's valid and not a placeholder
          if (best && !best.includes("1x2.gif")) image = best;
        }
      }

      // if we still don't have a valid image, try to extract it from the noscript tag
      // some websites put the actual image in noscript tags for non-JavaScript browsers
      if (!image) {
        // look for a noscript tag within the product element
        const noscript = el.querySelector("noscript")?.innerHTML;

        // if found, use regex to extract the image URL from the HTML inside
        if (noscript) {
          // use regex to find the src attribute of an img tag
          const match = noscript.match(/<img.*?src="(.*?)"/i);

          // if we found a match and it's not a placeholder, use it
          if (match && match[1] && !match[1].includes("1x2.gif")) {
            image = match[1]; // the image URL is in the first capturing group
          }
        }
      }

      // only include products that have the essential information (title, price, link)
      if (title && price && link) {
        // add this product with all its details to our results array
        items.push({
          title, // product name/title
          price, // product price (as text, includes currency symbol)
          link, // URL to the product page
          image, // product image URL (may be null if not found)
          shipping: shipping || null, // shipping information (null if not available)
          condition: condition || null, // product condition (null if not specified)
          location: location || null, // seller location (null if not specified)
          store: "eBay", // source marketplace name
        });
      }
    }

    // return the array of product objects back to Node.js context
    return items;
  });

  // close the browser to free up system resources
  // this is important to prevent memory leaks in longer-running applications
  await browser.close();

  // log summary information about what we scraped
  console.log(`scraped ${results.length} items:`);
  console.log(results); // log the full results objects (useful for debugging)

  // return the scraped product data for further processing
  return results;
};

// execute the scraper function with "iphone" as the search query
scrapeEbay("iphone")
  .then((scrapedData) => {
    // once scraping is complete, format and display the results in a readable way
    console.log("\nscraped data:");

    // loop through each product and print its details
    scrapedData.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`); // item number for readability
      console.log(`title: ${item.title}`); // product title
      console.log(`price: ${item.price}`); // product price
      console.log(`link: ${item.link}`); // product URL
      console.log(`image: ${item.image}`); // image URL
      console.log(`condition: ${item.condition}`); // product condition
      console.log(`shipping: ${item.shipping}`); // shipping details
      console.log(`location: ${item.location}`); // seller location
      console.log(`store: ${item.store}`); // source marketplace
    });

    // indicate the process has completed successfully
    console.log("\ndone");
  })
  // handle and log any errors that might occur during the scraping process
  .catch(console.error);
