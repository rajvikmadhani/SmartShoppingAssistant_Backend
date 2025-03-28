import puppeteer from "puppeteer"; // import the puppeteer library

//  function to scrape Amazon search results
const scrapeAmazon = async (query, maxPages = 3) => {
  const browser = await puppeteer.launch({ headless: true }); // launch a new browser instance
  const page = await browser.newPage(); // create a new page

  const url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`; // navigate to the Amazon search results page .com

  const baseUrl = url; // base URL for the search results
  let currentPageUrl = baseUrl; // current page URL
  let currentPage = 1; // current page number
  const allResults = []; // array to store all results

  // loop through pages
  while (currentPage <= maxPages && currentPageUrl) {
    console.log(`scraping page ${currentPage}: ${currentPageUrl}`); // log current page

    await page.goto(currentPageUrl, { waitUntil: "networkidle2" }); // go to the current page

    // accept cookies if prompted
    try {
      await page.waitForSelector('input[name="accept"]', { timeout: 1000 }); // wait for the cookie prompt to appear
      await page.click('input[name="accept"]'); // click the accept button
      console.log("accepted cookies"); // log accepted cookies
      await page.waitForTimeout(1000); // wait for 1 second
    } catch {
      console.log("no cookie prompt"); // no cookie prompt
    }

    // evaluate the page and extract the results, scrape items on the current page
    const results = await page.evaluate(() => {
      const items = []; // create an empty array to store the results

      // loop through each search result item
      document.querySelectorAll(".s-main-slot .s-result-item").forEach((el) => {
        const title = el.querySelector("h2 span")?.innerText; // extract the title
        const price = el.querySelector(".a-price .a-offscreen")?.innerText; // extract the price
        const rating = el.querySelector(".a-icon-alt")?.innerText; // extract the rating

        const linkEl =
          el.querySelector("h2 a") ||
          el.querySelector("a.a-link-normal.s-no-outline");
        const imageEl = el.querySelector("img.s-image"); // extract the image element
        const link = linkEl
          ? `https://www.amazon.com${linkEl.getAttribute("href")}`
          : undefined; // product link com
        const image = imageEl?.getAttribute("src"); // image URL

        const seller = el.querySelector(".s-byline span")?.innerText; // extract the seller name
        const badge = el.querySelector(".a-badge-text")?.innerText; // extract the badge text
        const isPrime = !!el.querySelector(".a-icon-prime"); // check if the item is prime
        const delivery = el.querySelector(
          ".a-color-secondary .a-text-bold"
        )?.innerText; // extract the delivery info

        if (title && link) {
          // include as long as there's a title and link (price may be missing in some sponsored ads)
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

      return items; // return the items
    });

    console.log(`page ${currentPage}: ${results.length} items scraped`); // log the number of items scraped
    allResults.push(...results); // add results to the allResults array

    // get the next page URL
    const nextUrl = await page.evaluate(() => {
      const nextLink = document.querySelector("ul.a-pagination li.a-last a"); // get the next link
      return nextLink ? nextLink.href : null; // return the href attribute of the next link
    });

    if (!nextUrl) break; // if no next link, break the loop

    currentPageUrl = nextUrl; // update the current page URL
    currentPage++; // add 1 to the current page number
  }

  await browser.close(); // close the browser
  return allResults; // return all results
};

// run the scraper
scrapeAmazon("iphone", 3)
  .then((results) => {
    console.log(`\ntotal items scraped: ${results.length}`);
    console.log("\nscraped data:");
    results.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`);
      console.log(`title: ${item.title}`);
      console.log(`price: ${item.price}`);
      console.log(`rating: ${item.rating}`);
      console.log(`link: ${item.link}`);
      console.log(`image: ${item.image}`);
      console.log(`seller: ${item.seller}`);
      console.log(`badge: ${item.badge}`);
      console.log(`prime eligible: ${item.isPrime}`);
      console.log(`delivery: ${item.delivery}`);
      console.log(`store: ${item.store}`);
    });
    console.log(results);
  })
  .catch(console.error); // catch and log any errors
