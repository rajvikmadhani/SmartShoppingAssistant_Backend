import puppeteer from "puppeteer"; // import the puppeteer library

// this function will scrape the Amazon and return 3 results
const scrapeAmazon = async (query) => {
  // launch a new browser instance
  const browser = await puppeteer.launch({ headless: true });
  // create a new page
  const page = await browser.newPage();

  // navigate to the Amazon search results page  .com
  // const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;

  // navigate to the Amazon search results page  .de
  const url = `https://www.amazon.de/s?k=${encodeURIComponent(query)}`;

  // wait until the page is fully loaded
  await page.goto(url, { waitUntil: "networkidle2" });

  // evaluate the page and extract the results
  const results = await page.evaluate(() => {
    // create an empty array to store the results
    const items = [];
    // loop through each search result item
    document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
      const title = el.querySelector("h2 span")?.innerText; // extract the title
      const price = el.querySelector(".a-price .a-offscreen")?.innerText; // extract the price
      const rating = el.querySelector(".a-icon-alt")?.innerText; // extract the rating
      if (title && price) {
        // if both title and price are available
        items.push({ title, price, rating, store: "Amazon" }); // add the item to the results array
      }
    });

    // return the top 3 results
    return items.slice(0, 3);
  });

  // close the browser
  await browser.close();
  // return the results
  return results;
};

// scrape iphone from Amazon
scrapeAmazon("iphone").then(console.log).catch(console.error);
