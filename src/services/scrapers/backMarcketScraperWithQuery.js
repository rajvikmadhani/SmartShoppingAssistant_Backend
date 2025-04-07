import puppeteer from "puppeteer-extra"; // import puppeteer-extra for stealth mode
import StealthPlugin from "puppeteer-extra-plugin-stealth"; // import stealth plugin

puppeteer.use(StealthPlugin()); // use stealth plugin to avoid detection

// helper function to scroll down the page to load all content
async function autoScroll(page) {
  // scroll down the page by a certain distance until the end of the page is reached
  await page.evaluate(async () => {
    // resolve the promise when the scroll is complete
    await new Promise((resolve) => {
      let totalHeight = 0; // total height scrolled
      const distance = 100; // distance to scroll each time
      const timer = setInterval(() => {
        // set an interval to scroll down the page
        const scrollHeight = document.body.scrollHeight; // total height of the page

        window.scrollBy(0, distance); // scroll down by the distance
        totalHeight += distance; // update the total height scrolled

        // if the total height scrolled is greater than or equal to the total height of the page, clear the interval and resolve the promise
        if (totalHeight >= scrollHeight) {
          clearInterval(timer); // clear the interval
          resolve(); // resolve the promise
        }
      }, 100); // scroll every 100 milliseconds
    });
  });
}

// helper function to sleep for a certain amount of time
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// function to scrape BackMarket website
const scraperBackMarket = async (searchQuery) => {
  // launch a new browser instance with Puppeteer
  // headless mode is set to "new" for better performance
  // args are set to disable sandboxing for better compatibility with some environments
  // set user agent to mimic a real browser
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // create a new page in the browser
  // set user agent to mimic a real browser
  const page = await browser.newPage();

  // set user agent to mimic a real browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // Store all products in this array
  let allProducts = [];
  let currentPage = 1;
  let hasNextPage = true;

  // URL to scrape with query parameter and page parameter
  const encodedQuery = encodeURIComponent(searchQuery);
  const baseUrl = `https://www.backmarket.com/en-us/search?q=${encodedQuery}`;

  console.log(`scrape BackMarket : "${searchQuery}"...`);

  // continue scraping while there are more pages
  while (hasNextPage) {
    // construct the URL for the current page
    const url = `${baseUrl}&page=${currentPage}`;
    //log the URL
    console.log(`\nnavigating to page ${currentPage}: ${url}`);

    // navigate to the URL
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    // wait for the page to load
    await sleep(6000);

    // scroll down to load all products
    await autoScroll(page);
    // wait for the page to load
    await sleep(2000);

    try {
      // wait for product cards to appear
      await page.waitForSelector('div[data-qa="productCard"]', {
        timeout: 15000,
      });

      // extract products from current page
      const products = await page.evaluate(() => {
        // items array to store product information
        const items = [];

        // cards array to store product cards
        const cards = document.querySelectorAll('div[data-qa="productCard"]');

        // loop through each product card and extract information
        for (const card of cards) {
          // basic information
          const title = card.querySelector("h2 a span")?.innerText?.trim();
          const price = card
            .querySelector('[data-qa="productCardPrice"]')
            ?.innerText?.trim();
          const originalPrice =
            card
              .querySelector('[data-qa="productCardOriginalPrice"]')
              ?.innerText?.trim() || null;

          // get product link
          const aTag = card.querySelector('h2 a[href^="/en-us/p/"]');
          const href = aTag?.getAttribute("href");
          const link = href ? `https://www.backmarket.com${href}` : null;

          // get product image
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

          // rating information
          const rating =
            card
              .querySelector('[data-spec="rating"] span.caption-bold')
              ?.innerText?.trim() || "No rating";

          // extract storage information from specs
          const specs = Array.from(
            card.querySelectorAll('[data-test="productspecs"] li')
          ).map((li) => li.textContent.trim());
          const storage =
            specs
              .find(
                (spec) =>
                  spec.includes("GB") ||
                  spec.includes("TB") ||
                  spec.includes("Storage")
              )
              ?.trim() || null;

          // calculate discount percentage if original price exists
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

          // check if all required fields are present
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
            });
          }
        }

        return items;
      });

      // add products from current page to all products
      allProducts = [...allProducts, ...products];
      // log the number of products scraped from the current page
      console.log(
        `scraped ${products.length} products from page ${currentPage}`
      );

      // check if there is a next page
      hasNextPage = await page.evaluate(() => {
        // look for next page button that's not disabled
        const nextButton = document.querySelector(
          '[data-qa="pagination-next-button"]:not([disabled])'
        );
        return !!nextButton;
      });

      if (hasNextPage) {
        currentPage++;
        await sleep(3000); // wait between page navigations to avoid rate limiting
      }
    } catch (error) {
      console.error(`error on page ${currentPage}:`, error.message);
      hasNextPage = false;
    }
  }

  await browser.close();

  // log the results
  console.log(`\ntotal products scraped: ${allProducts.length}\n`);
  allProducts.forEach((p, i) => {
    console.log(`iItem ${i + 1}`);
    console.log(`title    : ${p.title}`);
    console.log(`price    : ${p.price}`);
    console.log(`original price : ${p.originalPrice}`);
    console.log(`discount : ${p.discount}%`);
    console.log(`image    : ${p.image}`);
    console.log(`link     : ${p.link}`);
    console.log(`rating   : ${p.rating}`);
    console.log(`storage  : ${p.storage} \n`);
  });

  return allProducts;
};

scraperBackMarket("iphone").then((products) => {
  console.log(`\nscraping completed. total products: ${products.length}`);
});
