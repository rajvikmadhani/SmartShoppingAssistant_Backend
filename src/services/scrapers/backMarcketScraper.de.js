/***************************
 * this script is a web scraper for Back Market (German version)
 * it uses puppeteer-extra with the stealth plugin to avoid bot detection
 * and scrape product data from the site
 * the scraper is designed to handle dynamic content and lazy loading
 * it extracts product details like title, price, image, and specifications
 * the script includes error handling and logging for debugging purposes
 * the example function demonstrates how to use the scraper
 * and prints the results in a structured format
 *
 * scrapes multiple pages of products with detailed information
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
 * @param {string} domain - back Market domain (e.g., "backmarket.de")
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

      const storage_gb =
        specs.find(
          (spec) =>
            spec.includes("GB") ||
            spec.includes("TB") ||
            spec.includes("storage_gb")
        ) || null;

      let discount = null;
      if (price && originalPrice) {
        const priceValue = parseFloat(
          price.replace(/[^0-9,]/g, "").replace(",", ".")
        );
        const originalPriceValue = parseFloat(
          originalPrice.replace(/[^0-9,]/g, "").replace(",", ".")
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
          currency: "$",
          brand: "Unknown",
          availability: true,
          storage_gb,
          ram_gb: 0,
          ramMatch: 0,
          rating,
          shippingCost: 0,
          discount,
          link,
          image,
          seller: "Back Market",
          productSellerRate: 0,
          badge: "Unknown",
          isPrime: false,
          delivery: "Free delivery",
          store: `Back Market`,
          seller_rating: 0,
        });
      }
    }
    return items;
  }, domain);
}

/**
 * scraper function for Back Market (German version)
 * @param {string} searchTerm - term to search for (e.g. "iPhone")
 * @param {number} pagesToScrape - how many pages to scrape
 * @returns {Array} - collection of all product objects with their details
 */
export const backMarketScraper = async (
  searchTerm = "iPhone",
  pagesToScrape = 3
) => {
  const backMarketDomain = "backmarket.de";
  const langPath = "de-de";

  const encodedQuery = encodeURIComponent(searchTerm);
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
