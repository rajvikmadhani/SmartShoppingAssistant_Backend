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
 * scrapes Back Market search results with pagination support.
 *
 * @param {Object} productQuery - the search query containing brand, name, storage, RAM, and color.
 * @param {string} backMarketDomain - the Back Market domain to scrape (default is 'backmarket.com').
 * @returns {Promise<Array>} - array of product data.
 */
const backMarketScraper = async (
  productQuery,
  backMarketDomain = "backmarket.com"
) => {
  const { brand, name, storage_gb, ram_gb, color } = productQuery;

  const queryString = `${brand} ${name} ${storage_gb || ""}GB ${
    ram_gb || ""
  }GB ${color || ""}`.trim();
  const encodedQuery = encodeURIComponent(queryString);
  const baseUrl = `https://${backMarketDomain}/en-us/search?q=${encodedQuery}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  let allResults = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const currentPageUrl = `${baseUrl}&page=${currentPage}`;
    console.log(
      `scraping page ${currentPage} from ${backMarketDomain}: ${currentPageUrl}`
    );

    await page.goto(currentPageUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(5000);
    await autoScroll(page);
    await sleep(1500);

    try {
      await page.waitForSelector('div[data-qa="productCard"]', {
        timeout: 10000,
      });

      const results = await page.evaluate(() => {
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
              store: `Back Market (${window.location.hostname})`,
            });
          }
        }

        return items;
      });

      console.log(
        `page ${currentPage}: ${results.length} items scraped from ${backMarketDomain}`
      );
      allResults.push(...results);

      hasNextPage = await page.evaluate(() => {
        const nextButton = document.querySelector(
          '[data-qa="pagination-next-button"]:not([disabled])'
        );
        return !!nextButton;
      });

      if (hasNextPage) {
        currentPage++;
        await sleep(3000);
      }
    } catch (error) {
      console.error(`error scraping page ${currentPage}:`, error.message);
      hasNextPage = false;
    }
  }

  await browser.close();
  return allResults;
};

// Example usage
const exampleUsage = async () => {
  const productQuery = {
    brand: "Apple",
    name: "iPhone",
    storage_gb: "128",
    ram_gb: "",
    color: "black",
  };

  const products = await backMarketScraper(productQuery);
  console.log(`\ntotal products scraped: ${products.length}`);
  products.forEach((p, i) => {
    console.log(`\nproduct ${i + 1}:`);
    console.log(`title      : ${p.title}`);
    console.log(`price      : ${p.price}`);
    console.log(`original   : ${p.originalPrice}`);
    console.log(`discount   : ${p.discount}%`);
    console.log(`image      : ${p.image}`);
    console.log(`link       : ${p.link}`);
    console.log(`rating     : ${p.rating}`);
    console.log(`storage    : ${p.storage}`);
  });
};

exampleUsage();
