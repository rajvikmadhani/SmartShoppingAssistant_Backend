import puppeteer from "puppeteer"; // import the puppeteer library

// function to scrape eBay for a given query with pagination
const scrapeEbay = async (query, maxPages = 3) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // create a new page in the browser
  const page = await browser.newPage();

  // set user agent to mimic a real browser

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
  );

  // page setup
  let currentPage = 1;
  // link to the first page of search results
  let currentUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;
  // empty array to store all results
  const allItems = [];

  // loop through pages
  // while the current page is less than or equal to maxPages and currentUrl is not null
  while (currentPage <= maxPages && currentUrl) {
    // log current page and URL
    console.log(`scraping eBay page ${currentPage}: ${currentUrl}`);
    // go to the current page
    await page.goto(currentUrl, { waitUntil: "domcontentloaded" });
    // wait for the search results to load
    await page.waitForSelector(".s-item");
    // scroll to the bottom of the page to load lazy-loaded images
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // wait for lazy-loaded images to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //evaluate the page to scrape items
    const results = await page.evaluate(() => {
      // empty array to store items
      const items = [];
      // select all elements with the class "s-item"
      const elements = document.querySelectorAll(".s-item");

      // loop through the elements and extract the title, price, link, and image
      for (let el of elements) {
        // title, price, link, image, shipping, condition, location
        const title = el.querySelector(".s-item__title")?.innerText;
        const price = el.querySelector(".s-item__price")?.innerText;
        const link = el.querySelector(".s-item__link")?.href;
        const shipping = el.querySelector(".s-item__shipping")?.innerText;
        const condition = el.querySelector(".SECONDARY_INFO")?.innerText;
        const location = el.querySelector(".s-item__location")?.innerText;

        // null check for image element
        let image = null;
        // check for image element
        const imgEl =
          el.querySelector(".s-item__image-img") ||
          el.querySelector(".s-item__image img");

        // check if the image element exists and get the src attribute
        if (imgEl) {
          image =
            imgEl.getAttribute("src") ||
            imgEl.getAttribute("data-src") ||
            imgEl.getAttribute("data-img-src") ||
            imgEl.getAttribute("data-image-src");

          // check if the image is a 1x2.gif placeholder
          if (
            (!image || image.includes("1x2.gif")) &&
            imgEl.hasAttribute("srcset")
          ) {
            // fallback to highest-res image in srcset
            const srcset = imgEl.getAttribute("srcset");
            // split srcset by comma and get the last element
            const best = srcset.split(",").pop()?.trim().split(" ")[0];
            // check if the best image is not a 1x2.gif placeholder
            if (best && !best.includes("1x2.gif")) image = best;
          }
        }

        // fallback to noscript tag if image is not found
        if (!image) {
          // check if <noscript> tag exists and extract the image from it
          const noscript = el.querySelector("noscript")?.innerHTML;
          // check if noscript tag is not null and extract the image from it
          if (noscript) {
            // regex to match the image src in noscript tag
            const match = noscript.match(/<img.*?src="(.*?)"/i);
            // check if match is not null and extract the image src
            if (match && match[1] && !match[1].includes("1x2.gif")) {
              image = match[1];
            }
          }
        }

        // check if title, price, and link are available
        if (title && price && link) {
          // push the item to the items array
          items.push({
            title,
            price,
            link,
            image,
            shipping: shipping || null,
            condition: condition || null,
            location: location || null,
            store: "eBay",
          });
        }
      }

      // log the number of items scraped
      return items;
    });

    // log the number of items scraped
    console.log(`page ${currentPage}: ${results.length} items scraped`);
    // add results to the allItems array
    allItems.push(...results);

    // try to find next page URL
    const nextPage = await page.evaluate(() => {
      // get next page link
      const next = document.querySelector("a.pagination__next");
      // check if next page link is not null and return its href attribute
      return next?.href || null;
    });

    // log the next page URL
    if (!nextPage) break;
    // log the next page URL
    currentUrl = nextPage;
    // increment the current page
    currentPage++;
  }
  // close the browser
  await browser.close();

  // log the total number of items scraped
  console.log(`\ntotal scraped items: ${allItems.length}`);
  // log the scraped items
  return allItems;
};

// run scraper
scrapeEbay("iphone", 3)

  .then((scrapedData) => {
    // log the scraped data
    console.log("\nscraped data:");
    // loop through the scraped data and log each item
    scrapedData.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`);
      console.log(`title: ${item.title}`);
      console.log(`price: ${item.price}`);
      console.log(`link: ${item.link}`);
      console.log(`image: ${item.image}`);
      console.log(`condition: ${item.condition}`);
      console.log(`shipping: ${item.shipping}`);
      console.log(`location: ${item.location}`);
      console.log(`store: ${item.store}`);
    });
    console.log("\ndone");
  })
  // log any errors
  .catch(console.error);
