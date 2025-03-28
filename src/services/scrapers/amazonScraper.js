import puppeteer from "puppeteer"; // import puppeteer

// function to scrape Amazon search results with pagination
const scrapeAmazon = async (query, maxPages = 3) => {
  // launch browser
  const browser = await puppeteer.launch({ headless: true });
  // create new page
  const page = await browser.newPage();

  // set user agent to prevent Amazon from blocking the request
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  const baseUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
  // current page URL
  let currentPageUrl = baseUrl;
  // current page number
  let currentPage = 1;
  // array to store all results
  const allResults = [];

  // loop through pages
  while (currentPage <= maxPages && currentPageUrl) {
    // log current page
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`);
    // go to the current page
    await page.goto(currentPageUrl, { waitUntil: "networkidle2" });

    // accept cookies
    try {
      // wait for the cookie prompt to appear
      await page.waitForSelector('input[name="accept"]', { timeout: 3000 });
      // click the accept button
      await page.click('input[name="accept"]');
      // log accepted cookies
      console.log("accepted cookies");
      // wait for 1 second
      await page.waitForTimeout(1000);
    } catch {
      // no cookie prompt
      console.log("no cookie prompt");
    }

    // scrape products
    const results = await page.evaluate(() => {
      // array to store items
      const items = [];

      // loop through each item on the page
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        // get title, price, rating, link, image, seller, badge, isPrime, and delivery
        const title = el.querySelector("h2 span")?.innerText;
        const price = el.querySelector(".a-price .a-offscreen")?.innerText;
        const rating = el.querySelector(".a-icon-alt")?.innerText;
        const image = el.querySelector(".s-image")?.src;
        const seller = el.querySelector(
          ".a-row.a-size-base.a-color-secondary"
        )?.innerText;
        const badge = el.querySelector(".s-badge-text")?.innerText;
        const isPrime = !!el.querySelector(".a-icon-prime");
        const delivery = el.querySelector(
          ".a-color-base.a-text-bold"
        )?.innerText;
        const asin = el.getAttribute("data-asin"); // get ASIN
        const link = asin ? `https://www.amazon.com/dp/${asin}` : undefined; // clean product detail page link

        // add item to the array if title and price are available
        if (title && price) {
          items.push({
            title,
            price,
            rating,
            link,
            image,
            seller,
            badge,
            isPrime,
            delivery,
            store: "Amazon",
          });
        }
      });
      // return the items
      return items;
    });

    // log the number of items scraped
    console.log(`page ${currentPage}: ${results.length} items scraped`);
    // add results to the allResults array
    allResults.push(...results);

    // get next page path (try both old and new selectors)
    const nextPagePath = await page.evaluate(() => {
      // get the next link
      const nextLinkOld = document.querySelector("ul.a-pagination li.a-last a");
      // get the next link
      const nextLinkNew = document.querySelector("a.s-pagination-next");
      // return the href attribute of the next link
      return (
        nextLinkOld?.getAttribute("href") ||
        nextLinkNew?.getAttribute("href") ||
        null
      );
    });

    // if no next page, break the loop
    if (!nextPagePath) {
      // log no next page
      console.log("no next page link found.");
      break;
    }

    // convert to full URL
    currentPageUrl = `https://www.amazon.com${nextPagePath}`;
    // increment page number
    currentPage++;
  }

  // close the browser
  await browser.close();
  // return all results
  return allResults;
};

// run the scraper
scrapeAmazon("iphone", 2)
  .then((results) => {
    // log the total number of items scraped
    console.log(`\ntotal items scraped: ${results.length}`);
    // log the results
    console.log(results);
  })
  // catch and log any errors
  .catch(console.error);
