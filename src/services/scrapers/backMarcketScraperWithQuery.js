import puppeteer from "puppeteer-extra"; // import puppeteer-extra for stealth mode
import StealthPlugin from "puppeteer-extra-plugin-stealth"; // import stealth plugin

puppeteer.use(StealthPlugin()); // use stealth plugin to avoid detection

const sleep = (ms) => new Promise((res) => setTimeout(res, ms)); // sleep function to pause execution for a given time

const scrapeBackMarket = async () => {
  // launch a new browser instance with Puppeteer
  // headless mode is set to "new" for better performance
  // args are set to disable sandboxing for better compatibility with some environments
  // set user agent to mimic a real browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage(); // create a new page in the browser

  // set user agent to mimic a real browser
  // this is important to avoid detection by the website
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // url to scrape
  const url = "https://www.backmarket.com/en-us/search?q=iphone";
  // navigate to the url
  console.log("navigating to:", url);
  // wait for the page to load
  // wait for the DOM content to be loaded
  // set timeout to 60 seconds to avoid timeout errors
  // this is important to avoid detection by the website
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  // wait for the page to load
  await sleep(6000);
  // scroll down the page to load more products
  // this is important to load more products
  await page.evaluate(() => window.scrollBy(0, 2000));

  // wait for the page to load
  await sleep(4000);

  // scroll down the page to load more products
  // this is important to load more products
  await page.waitForSelector('div[data-qa="productCard"]', { timeout: 15000 });

  // evaluate the page to extract product information

  const products = await page.evaluate(() => {
    // items array to store product information
    const items = [];

    // select all product cards on the page
    const cards = document.querySelectorAll('div[data-qa="productCard"]');

    //  loop through each product card and extract information
    for (const card of cards) {
      const title = card.querySelector("h2 a span")?.innerText?.trim(); // extract product title
      const price = card
        .querySelector('[data-qa="productCardPrice"]')
        ?.innerText?.trim(); // extract product price

      const aTag = card.querySelector('h2 a[href^="/en-us/p/"]'); // select the anchor tag that contains the product link
      const href = aTag?.getAttribute("href"); // extract the href attribute from the anchor tag
      const link = href ? `https://www.backmarket.com${href}` : null; // construct the full product link

      let image = null; // initialize image variable to null
      const img = card.querySelector("img"); // select the image element within the product card

      // if the image element exists, extract the srcset and src attributes
      // and extract the image URL from them
      if (img) {
        const srcset = img.getAttribute("srcset"); // extract the srcset attribute from the image element
        const rawSrc = img.getAttribute("src"); // extract the src attribute from the image element

        // function to extract the image URL from the srcset or src attributes
        // it decodes the URL and matches it with a regex pattern to extract the URL
        const extractImageURL = (val) => {
          const decoded = decodeURIComponent(val);
          const match = decoded.match(/https:\/\/[^ ]+/);
          return match ? match[0] : null;
        };

        // if the srcset attribute exists, split it by commas and extract the last URL
        // if the srcset attribute does not exist, extract the URL from the src attribute
        // if neither exists, set image to null
        if (srcset) {
          const srcs = srcset.split(",").map((s) => s.trim().split(" ")[0]);
          const highRes = srcs[srcs.length - 1];
          image = extractImageURL(highRes);
        }

        // if the srcset attribute does not exist, extract the URL from the src attribute
        // if neither exists, set image to null
        if (!image && rawSrc) {
          image = extractImageURL(rawSrc);
        }
      }

      // extract the rating from the product card
      const rating =
        card
          .querySelector('[data-spec="rating"] span.caption-bold')
          ?.innerText?.trim() || "No rating";
      const store = "BackMarket"; // set store name to "BackMarket"

      // check if all required fields are present
      if (title && price && link && image) {
        items.push({ title, price, image, link, rating, store }); // push the product information to the items array
      }

      // check if the items array has reached the maximum limit of 10 products
      if (items.length >= 10) break;
    }

    // return the items array containing the product information
    return items;
  });

  // close the browser instance
  await browser.close();

  // log the number of products scraped and their information to the console
  console.log(`\nscraped ${products.length} products:\n`);
  products.forEach((product, index) => {
    console.log(`item : ${index + 1}`); // log the product number
    console.log(`title  : ${product.title}`); // log the product title
    console.log(`price  : ${product.price}`); // log the product price
    console.log(`image  : ${product.image}`); // log the product image URL
    console.log(`link   : ${product.link}`); // log the product link
    console.log(`rating : ${product.rating}`); //  log the product rating
    console.log(`store  : ${product.store} \n`); // log the store name
  });
};

// scrapeBackMarket function is called to start the scraping process
scrapeBackMarket();
