import puppeteer from "puppeteer"; // import the puppeteer library

//  function to scrape Amazon search results
const scrapeAmazon = async (query, maxPages = 3) => {
  // launch a new browser instance
  const browser = await puppeteer.launch({ headless: true });
  // create a new page
  const page = await browser.newPage();

  // navigate to the Amazon search results page  .com
  // const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

  // navigate to the Amazon search results page  .de
  const url = `https://www.amazon.de/s?k=${encodeURIComponent(query)}`;

  const baseUrl = url; // base URL for the search results
  let currentPageUrl = baseUrl; // current page URL
  let currentPage = 1; // current page number
  const allResults = []; // array to store all results

  // loop through pages
  while (currentPage <= maxPages && currentPageUrl) {
    // log current page
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`);

    // go to the current page
    await page.goto(currentPageUrl, { waitUntil: "networkidle2" });

    // accept cookies if prompted
    try {
      // wait for the cookie prompt to appear
      await page.waitForSelector('input[name="accept"]', { timeout: 1000 });
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

    // evaluate the page and extract the results
    const results = await page.evaluate(() => {
      // create an empty array to store the results
      const items = [];
      // loop through each search result item
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        //get title, price, and rating
        const title = el.querySelector("h2 span")?.innerText; // extract the title
        const price = el.querySelector(".a-price .a-offscreen")?.innerText; // extract the price
        const rating = el.querySelector(".a-icon-alt")?.innerText; // extract the rating
        const linkEl =
          el.querySelector("h2 a") ||
          el.querySelector("a.a-link-normal.s-no-outline");
        // const link = linkEl
        //   ? new URL(
        //       linkEl.getAttribute("href"),
        //       "https://www.amazon.de"
        //     ).toString()
        //   : undefined;

        const imageEl = el.querySelector("img.s-image"); // extract the image element

        const link = linkEl
          ? `https://www.amazon.de${linkEl.getAttribute("href")}`
          : undefined; // product link
        const image = imageEl?.getAttribute("src"); // image URL

        if (title && price) {
          // if both title and price are available
          items.push({ title, price, rating, link, image, store: "Amazon" }); // add the item to the results array
        }
      });

      // return the items
      return items;
    });
    // log the number of items scraped
    console.log(`page ${currentPage}: ${results.length} items scraped`);
    allResults.push(...results); // add results to the allResults array

    // get the next page URL
    const nextUrl = await page.evaluate(() => {
      // get the next link
      const nextLink = document.querySelector("ul.a-pagination li.a-last a");
      // return the href attribute of the next link
      return nextLink ? nextLink.href : null;
    });

    // if no next link, break the loop
    if (!nextUrl) break;

    // update the current page URL and increment the page number
    currentPageUrl = nextUrl;

    //  add 1 to the current page number
    currentPage++;
  }

  // close the browser
  await browser.close();
  // return all results
  return allResults;
};

// run the scraper
scrapeAmazon("iphone", 3)
  .then((results) => {
    // log the total number of items scraped
    console.log(`\ntotal items scraped: ${results.length}`);
    console.log("\nscraped Data:");

    // loop through the results and log each item
    results.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`);
      console.log(`title: ${item.title}`);
      console.log(`price: ${item.price}`);
      console.log(`link: ${item.link}`);
      console.log(`image: ${item.image}`);
      console.log(`store: ${item.store}`);
    });

    // log the results
    console.log(results);
  })
  // catch and log any errors
  .catch(console.error);
