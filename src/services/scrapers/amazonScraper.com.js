import puppeteer from "puppeteer";

const scrapeAmazon = async (query) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  let currentPageUrl = baseUrl;
  let currentPage = 1;
  const allResults = [];

  while (currentPageUrl) {
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`);

    await page.goto(currentPageUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    try {
      await page.waitForSelector(
        '#sp-cc-accept, input[name="accept"], button[name="accept"]',
        { timeout: 1000 }
      );
      await page.click(
        '#sp-cc-accept, input[name="accept"], button[name="accept"]'
      );
      console.log("accepted cookies");
      await page.waitForTimeout(1000);
    } catch {
      console.log("no cookie prompt");
    }

    try {
      await page.waitForSelector(".s-main-slot .s-result-item", {
        timeout: 10000,
      });
    } catch {
      console.warn("no product results loaded (maybe blocked). Exiting.");
      break;
    }

    const results = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        const title = el.querySelector("h2 span")?.innerText;
        const price = el.querySelector(".a-price .a-offscreen")?.innerText;
        const rating = el.querySelector(".a-icon-alt")?.innerText;

        if (title && price) {
          items.push({ title, price, rating, store: "Amazon" });
        }
      });
      return items;
    });

    console.log(`page ${currentPage}: ${results.length} items scraped`);
    allResults.push(...results);

    const nextPagePath = await page.evaluate(() => {
      const nextOld = document.querySelector("ul.a-pagination li.a-last a");
      const nextNew = document.querySelector("a.s-pagination-next");
      return (
        nextOld?.getAttribute("href") || nextNew?.getAttribute("href") || null
      );
    });

    if (!nextPagePath) {
      console.log("no more pages found.");
      break;
    }

    currentPageUrl = `https://www.amazon.com${nextPagePath}`;
    currentPage++;
  }

  await browser.close();
  return allResults;
};

scrapeAmazon("iphone")
  .then((results) => {
    console.log(`\ntotal items scraped: ${results.length}`);
    console.log(results);
  })
  .catch(console.error);
