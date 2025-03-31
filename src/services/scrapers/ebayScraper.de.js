import puppeteer from "puppeteer"; // import puppeteer for web scraping

// function to scrape eBay for a given query
const scrapeEbay = async (query) => {
  // launch a new browser instance
  const browser = await puppeteer.launch({ headless: true });
  // create a new page in the browser
  const page = await browser.newPage();

  // set the user agent to mimic a real browser
  const searchUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;

  // navigate to the search URL
  await page.goto(searchUrl, { waitUntil: "networkidle2" });

  // console log the search URL
  console.log(`scraping eBay: ${searchUrl}`);

  // wait for the product list container
  await page.waitForSelector(".s-item");

  // wait for the product list to load
  const results = await page.evaluate(() => {
    // select the product list container
    const items = [];

    // select all product items
    const elements = document.querySelectorAll(".s-item");

    // loop through the product items and extract data
    for (let i = 0; i < elements.length && items.length < 3; i++) {
      // get the current product item
      const el = elements[i];

      // extract the title, price, and link from the product item
      const title = el.querySelector(".s-item__title")?.innerText;
      const price = el.querySelector(".s-item__price")?.innerText;
      const link = el.querySelector(".s-item__link")?.href;

      // check if the title, price, and link are not null or undefined
      if (title && price && link) {
        items.push({ title, price, link, store: "eBay" });
      }
    }

    //  return the extracted items
    return items;
  });

  // close the browser instance
  await browser.close();

  //  log the number of scraped items
  console.log(`scraped ${results.length} items:`);
  // log the scraped items
  console.log(results);

  // return the scraped items
  return results;
};

// run scraper for iphone
scrapeEbay("iphone")
  // console done message
  .then(() => console.log("done"))
  // catch any errors and log them
  .catch(console.error);
