import puppeteer from "puppeteer"; // import the puppeteer library for web automation and scraping

/**
 * function to scrape eBay product listings based on a search query
 * this function launches a headless browser, navigates to eBay search results,
 * and extracts product information including titles, prices, links, and images
 *
 * @param {string} query - the search term to look for on eBay
 * @returns {Promise<Array>} - a promise that resolves to an array of product objects
 */
const scrapeEbay = async (query) => {
  // browser launch options
  // headless: true for production, false for debugging
  // args: ["--no-sandbox", "--disable-setuid-sandbox"] for Linux environments
  // these arguments help prevent permission issues in Docker/CI environments
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // create a new page in the browser
  // this is equivalent to opening a new tab in a browser
  const page = await browser.newPage();

  // set the viewport size to 1920x1080 for consistent rendering
  // this line is commented out but would set a specific browser window size
  // await page.setViewport({ width: 1920, height: 1080 });

  // set a custom user agent to mimic a real browser
  // this can help avoid detection as a bot
  // and improve the chances of getting the desired content
  // user agents identify the browser and operating system to websites
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
  );

  // construct the eBay search URL with the encoded query parameter
  // encodeURIComponent ensures special characters in the query are properly URL-encoded
  // for example, spaces become %20, which is necessary for a valid URL
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;

  // log the URL being scraped for debugging purposes
  // this helps track which page is being accessed
  console.log(`scraping eBay: ${searchUrl}`);

  // navigate to the search URL and wait for the DOM content to be loaded
  // waitUntil: "domcontentloaded" is faster than waiting for all resources
  // it ensures the basic HTML structure is available before proceeding
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  // wait for the search results to load by checking for the presence of item elements
  // this ensures we don't proceed until actual product listings are available
  await page.waitForSelector(".s-item");

  // scroll to trigger lazy-loaded images
  // many websites only load images when they come into view (lazy loading)
  // scrolling to the bottom ensures more content is loaded
  await page.evaluate(() => {
    // scroll to the bottom of the page to load more items
    // this executes in the context of the browser page
    window.scrollTo(0, document.body.scrollHeight);
  });

  // pause execution for 3 seconds to allow lazy-loaded content to appear
  // this is a more explicit alternative to page.waitForTimeout()
  // gives time for AJAX requests and dynamic content to load
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // execute JavaScript in the context of the web page to extract product data
  // page.evaluate runs the provided function in the browser context
  const results = await page.evaluate(() => {
    // initialize an empty array to store the scraped product data
    const items = [];

    // select all elements with the class "s-item", which are the product listings
    // these are the container elements for each product on the search results page
    const elements = document.querySelectorAll(".s-item");

    // loop through each product listing
    // limit to the first 3 products that have all required information
    for (let i = 0; i < elements.length && items.length < 3; i++) {
      // get the current product element to extract data from
      const el = elements[i];

      // extract product details using CSS selectors with optional chaining (?.)
      // optional chaining prevents errors if elements don't exist
      const title = el.querySelector(".s-item__title")?.innerText; // product title
      const price = el.querySelector(".s-item__price")?.innerText; // product price
      const link = el.querySelector(".s-item__link")?.href; // product page URL

      // handle lazy-loaded images with multiple fallback strategies
      // images might be stored in different attributes depending on loading state
      let image = null;

      // check for the image element with different possible class names
      // using OR (||) operator to try alternative selectors if first one returns null
      const imgEl =
        el.querySelector(".s-item__image-img") ||
        el.querySelector(".s-item__image img");

      // try multiple possible attribute locations for the image URL
      // websites often use different attributes for storing image URLs
      if (imgEl) {
        image =
          imgEl.getAttribute("src") || // standard image source
          imgEl.getAttribute("data-src") || // lazy-load data attribute
          imgEl.getAttribute("data-img-src") || // alternative lazy-load attribute
          imgEl.getAttribute("data-image-src"); // another alternative attribute

        // fallback to highest-resolution image in srcset if main image is placeholder
        // srcset contains multiple image resolutions for responsive display
        if (
          // check if image is null or contains "1x2.gif" (a common placeholder)
          (!image || image.includes("1x2.gif")) &&
          // check if imgEl has attribute "srcset" with alternative images
          imgEl.hasAttribute("srcset")
        ) {
          // get the srcset attribute which contains multiple image URLs with sizes
          const srcset = imgEl.getAttribute("srcset");

          // extract the highest resolution image (typically the last in the list)
          // split by comma, get last entry, trim whitespace, then get URL part
          const best = srcset.split(",").pop()?.trim().split(" ")[0];

          // use this image if it's valid and not a placeholder
          if (best && !best.includes("1x2.gif")) image = best;
        }
      }

      // advanced fallback: extract image from <noscript> tag if still null
      // some sites put real image URLs in noscript tags for non-JS browsers
      if (!image) {
        // check if <noscript> tag exists within this product element
        const noscript = el.querySelector("noscript")?.innerHTML;

        // if noscript content exists, try to extract image URL with regex
        if (noscript) {
          // use regex to find src attribute in an img tag within noscript content
          const match = noscript.match(/<img.*?src="(.*?)"/i);

          // if match found and it's not a placeholder, use this image
          if (match && match[1] && !match[1].includes("1x2.gif")) {
            // match[1] contains the first capturing group (the URL)
            image = match[1];
          }
        }
      }

      // only add items that have all the required basic information
      // this ensures we only collect complete product data
      if (title && price && link) {
        // add the product details to our results array
        items.push({
          title, // product title text
          price, // price as displayed text
          link, // full URL to product page
          image, // image URL (may be null if not found)
          store: "eBay", // identify the source of this product
        });
      }
    }

    // return the collected items array to the Node.js context
    return items;
  });

  // close the browser to free up system resources
  // important to prevent memory leaks in longer-running applications
  await browser.close();

  // log the number of items successfully scraped for monitoring
  console.log(`scraped ${results.length} items:`);

  // log the raw scraped data objects for debugging
  console.log(results);

  // return the scraped items for further processing
  return results;
};

// execute the scraping function with "iphone" as the test query
scrapeEbay("iphone")
  .then((scrapedData) => {
    // format and display the scraped data in a more readable way
    console.log("\nscraped data:");

    // iterate through each item and print its details
    scrapedData.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`); // numbering each item for clarity
      console.log(`title: ${item.title}`); // display product title
      console.log(`price: ${item.price}`); // display product price
      console.log(`link: ${item.link}`); // display product URL
      console.log(`image: ${item.image}`); // display image URL (may be null)
      console.log(`store: ${item.store}`); // display source store name
    });

    // indicate the scraping process has completed successfully
    console.log("\ndone");
  })
  // catch and log any errors that occur during the scraping process
  // this ensures the application doesn't crash silently if something fails
  .catch(console.error);
