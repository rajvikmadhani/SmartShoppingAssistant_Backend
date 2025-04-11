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

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * extract product data from the current page
 * @param {Object} page - puppeteer page instance
 * @param {string} domain - back Market domain (e.g., "backmarket.com")
 * @returns {Array} - list of products on the current page
 */
async function extractProductsFromPage(page, domain) {
  return await page.evaluate((domain) => {
    const items = [];
    const cards = document.querySelectorAll('div[data-qa="productCard"]');

    // determine the correct path format based on domain and current URL
    const urlPath = window.location.pathname.startsWith("/de-de/")
      ? "/de-de/p/"
      : "/en-us/p/";
    const baseUrl = `https://www.${domain}`;

    for (const card of cards) {
      const title = card.querySelector("h2 a span")?.innerText?.trim();
      const price = card
        .querySelector('[data-qa="productCardPrice"]')
        ?.innerText?.trim();
      const originalPrice =
        card
          .querySelector('[data-qa="productCardOriginalPrice"]')
          ?.innerText?.trim() || null;

      const aTag = card.querySelector("h2 a");
      const href = aTag?.getAttribute("href");
      const link = href ? `${baseUrl}${href}` : null;

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
  }, domain);
}

/**
 * scraper function for Back Market
 * @param {Object} productQuery - search parameters for finding products
 * @param {string} backMarketDomain - which Back Market domain to use
 * @param {number} pagesToScrape - how many pages to scrape
 * @returns {Array} - collection of all product objects with their details
 */
export const backMarketScraper = async (
  productQuery,
  backMarketDomain = "backmarket.com",
  pagesToScrape = 3
) => {
  const { brand, name, storage_gb, ram_gb, color } = productQuery;

  // determine language path based on domain
  const langPath = backMarketDomain === "backmarket.de" ? "de-de" : "en-us";

  const queryString = `${brand} ${name} ${storage_gb || ""}GB ${
    ram_gb || ""
  }GB ${color || ""}`.trim();
  const encodedQuery = encodeURIComponent(queryString);
  const baseUrl = `https://${backMarketDomain}/${langPath}/search?q=${encodedQuery}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  let allResults = [];

  try {
    // process each page sequentially
    for (let currentPage = 1; currentPage <= pagesToScrape; currentPage++) {
      // construct URL with page parameter (first page doesn't need &page=1)
      const pageUrl =
        currentPage === 1 ? baseUrl : `${baseUrl}&page=${currentPage}`;

      console.log(`scraping page ${currentPage} from ${pageUrl}`);

      await page.goto(pageUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await sleep(5000);

      // log current URL for debugging
      const currentUrl = page.url();
      console.log(`now on URL: ${currentUrl}`);

      // scroll to load all lazy-loaded content
      await autoScroll(page);
      await sleep(1500);

      // wait for product cards to appear
      await page.waitForSelector('div[data-qa="productCard"]', {
        timeout: 10000,
      });

      // extract products from the current page
      const pageResults = await extractProductsFromPage(page, backMarketDomain);

      console.log(`page ${currentPage}: ${pageResults.length} items scraped`);

      // add this page's results to our overall collection
      allResults.push(...pageResults);
    }
  } catch (error) {
    console.error(`error during scraping:`, error.message);
  } finally {
    // always close the browser to free resources
    await browser.close();
  }

  return allResults;
};

/**
 * example function demonstrating how to use the scraper
 */
const exampleUsage = async () => {
  // example product search criteria
  const productQuery = {
    brand: "Apple",
    name: "iPhone",
    storage_gb: "128",
    ram_gb: "",
    color: "white",
  };

  // run the scraper with the example query
  const products = await backMarketScraper(productQuery);

  // log the total number of products found
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
    console.log(`shop       : ${product.store}`);
  });
};

// execute the example function
exampleUsage();
