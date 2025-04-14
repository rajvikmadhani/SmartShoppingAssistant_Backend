import puppeteer from "puppeteer"; // import the Puppeteer library for web scraping

/**
 * scrapes product listings from Newegg based on a search query
 * @param {string} query - the search term to look up on Newegg
 * @returns {Promise<Array>} - array of product objects with details
 */
export const scrapeNewegg = async (query) => {
  // initialize a headless browser instance
  // headless:true means the browser will run in the background without a visible UI
  // --no-sandbox and --disable-setuid-sandbox are flags to run the browser in a sandboxed environment
  // --disable-setuid-sandbox is used to disable the setuid sandbox for security reasons
  // the args prevent common sandbox-related issues when running in certain environments
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // create a new browser page/tab
  const page = await browser.newPage();

  // set a realistic user agent to avoid being blocked by the website
  // this mimics a Chrome browser on Windows 10
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  // array to store all scraped product data
  const results = [];

  // pagination variables
  let currentPage = 1; // start from the first page
  const maxPages = 20; // limit to prevent excessive scraping

  // loop through pages until we hit the max or run out of products
  while (currentPage <= maxPages) {
    // generate the URL for the current page
    // the URL format is different for the first page vs subsequent pages
    const url =
      currentPage === 1
        ? `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}`
        : `https://www.newegg.com/p/pl?d=${encodeURIComponent(
            query
          )}&page=${currentPage}`;

    // log the current page
    console.log(`scraping page ${currentPage}: ${url}`);

    // navigate to the URL and wait for content to load
    // domcontentloaded is faster than networkidle0 but might be less reliable
    // 60 second timeout prevents hanging on slow connections
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // check if the page contains any product listings
    const hasProducts = await page.$(".item-cell");
    if (!hasProducts) {
      // if no products are found, we've reached the end of results
      console.log("no more product listings found. stopping.");
      break;
    }

    // wait for product elements to be visible in the DOM
    // this ensures the page has loaded enough to extract data
    await page.waitForSelector(".item-cell", { timeout: 10000 });

    // execute JavaScript in the context of the page to extract product data
    const products = await page.evaluate(() => {
      const items = [];
      // select all product containers and iterate through them
      document.querySelectorAll(".item-cell").forEach((el) => {
        try {
          const titleEl = el.querySelector(".item-title"); // select the title element
          const link = titleEl?.href || null; // get the product link
          const title = titleEl?.innerText?.trim() || null; // get the product title

          const priceWhole = el.querySelector(
            ".price-current strong"
          )?.innerText; // get the whole number part of the price
          const priceFraction =
            el.querySelector(".price-current sup")?.innerText; // get the fractional part of the price

          const priceWithSymbol =
            priceWhole && !isNaN(priceWhole)
              ? `${parseFloat(`${priceWhole}.${priceFraction || "00"}`).toFixed(
                  2
                )}$`
              : "N/A"; // format the price to two decimal places

          const price = priceWithSymbol.replace(/[^0-9.]/g, "");

          const imgEl = el.querySelector("img"); // select the image element
          let image =
            imgEl?.getAttribute("src") ||
            imgEl?.getAttribute("data-src") ||
            "N/A"; // get the image URL from either src or data-src attribute

          // clean up the image URL if it starts with "//"
          // this is a common pattern for URLs that are protocol-relative
          if (image && image.startsWith("//")) image = "https:" + image;

          const ratingEl = el.querySelector(".item-rating"); // select the rating element
          const rating = ratingEl?.title || "N/A"; // get the rating title

          const shippingCostEl = el.querySelector(".price-ship"); // select the shippingCost element
          const shippingCost = shippingCostEl?.innerText?.trim() || "N/A"; // get the shippingCost cost

          // only add products that have at least a title and link
          if (title && link) {
            items.push({
              title,
              price,
              currency: "$",
              brand: "Unknown",
              availability: true,
              storage_gb: 128,
              ram_gb: 0,
              ramMatch: 0,
              rating,
              shippingCost,
              discount: 0,
              link,
              image,
              seller: "Newegg",
              productSellerRate: 0,
              badge: "Unknown",
              isPrime: false,
              delivery: "Free delivery",
              store: "Newegg",
              seller_rating: 0,
            });
          }
        } catch (err) {
          //  ignore any errors
        }
      });
      // return the array of product objects
      return items;
    });

    // add the products from this page to the overall results
    results.push(...products);
    // log the number of products found on this page
    // this helps track progress
    console.log(`found ${products.length} items on page ${currentPage}`);

    // move to the next page
    currentPage++;

    //  check max pages
    if (currentPage > maxPages) {
      // log a message reached the maximum page limit
      console.log("reached Newegg maximum page.");
      break; // exit the loop if we hit the max pages
    }
  }

  // clean up by closing the browser
  await browser.close();
  // return all collected product data
  return results;
};

/*____________________________________________

Example usage of the scrapeNewegg function
______________________________________________*/

/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  

CAUTION: this script must run more than once to receive all 700 results,
many times it only scrapes the first page but normally it scrapes all the results
i scrape 700 results with this script, but it may not work for you
it may be a problem with the Newegg website or the script itself

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/

// execute the scraper function with "iphone" as the search query
// no page limit is specified, so it will scrape all available pages
// more than 700 results are expected for the search term "iphone"
// this is a demonstration, you can change the query to any other term
// scrapeNewegg("iphone")
//   .then((items) => {
//     // when scraping is complete, display the results
//     console.log("\nscraped data:");

//     // log the total number of products found across all pages
//     // \n adds a blank line before this output for better readability
//     console.log(`\ntotal items scraped: ${items.length}`);

//     // format and print details for each product
//     items.forEach((item, index) => {
//       console.log(`#${index + 1}`); // item count
//       console.log(`title   : ${item.title}`); // title
//       console.log(`price   : ${item.price}`); // price
//       console.log(`currency: ${item.currency}`); // currency
//       console.log(`brand   : ${item.brand}`); // brand
//       console.log(`availability: ${item.availability}`); // availability
//       console.log(`storage_gb: ${item.storage_gb}`); // storage_gb
//       console.log(`ram_gb  : ${item.ram_gb}`); // ram_gb
//       console.log(`ramMatch: ${item.ramMatch}`); // ramMatch
//       console.log(`rating  : ${item.rating}`); // rating
//       console.log(`shippingCost: ${item.shippingCostCost}`); // shippingCost
//       console.log(`discount: ${item.discount}`); // discount
//       console.log(`link    : ${item.link}`); // link
//       console.log(`image   : ${item.image}`); // image
//       console.log(`seller  : ${item.seller}`); // seller
//       console.log(`productSellerRate: ${item.productSellerRate}`); // productSellerRate
//       console.log(`badge   : ${item.badge}`); // badge
//       console.log(`isPrime : ${item.isPrime}`); // isPrime
//       console.log(`delivery: ${item.delivery}`); // delivery
//       console.log(`store   : ${item.store}\n`); // store name
//       console.log(`seller_rating: ${item.seller_rating}`); // seller rating
//       console.log(`----------------------------------------`); // separator for readability

//       // log the complete dataset of all products scraped
//       // displays all product information collected during the scraping process
//       console.log(items);
//     });
//   })
//   .catch((err) => {
//     // handle any errors that occur during the scraping process
//     // log the error message to the console
//     console.error("error during scraping:", err);
//   });
