import puppeteer from "puppeteer"; // import the puppeteer library

// function to scrape eBay for a given query
const scrapeEbay = async (query) => {
  // browser launch options
  // headless: true for production, false for debugging
  // args: ["--no-sandbox", "--disable-setuid-sandbox"] for Linux environments
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // create a new page in the browser
  const page = await browser.newPage();

  // set the viewport size to 1920x1080 for consistent rendering
  // await page.setViewport({ width: 1920, height: 1080 });

  // set a custom user agent to mimic a real browser
  // this can help avoid detection as a bot
  // and improve the chances of getting the desired content
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
  );

  // set a custom referer to mimic a real browser
  const searchUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;
  // navigate to the search URL
  console.log(`scraping eBay: ${searchUrl}`);

  // wait for the page to load and the DOM to be ready
  // using waitUntil: "domcontentloaded" to ensure the DOM is fully loaded
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });

  // wait for the search results to load

  await page.waitForSelector(".s-item");

  // scroll to trigger lazy-loaded images
  await page.evaluate(() => {
    // scroll to the bottom of the page to load more items
    window.scrollTo(0, document.body.scrollHeight);
  });

  // manual wait instead of page.waitForTimeout
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // wait for the search results to load again
  const results = await page.evaluate(() => {
    // select the items from the search results
    const items = [];

    // select all elements with the class "s-item"
    const elements = document.querySelectorAll(".s-item");

    // loop through the elements and extract the title, price, link, and image
    for (let i = 0; i < elements.length && items.length < 3; i++) {
      // get the current element
      const el = elements[i];

      // extract the title, price, and link from the element
      const title = el.querySelector(".s-item__title")?.innerText;
      const price = el.querySelector(".s-item__price")?.innerText;
      const link = el.querySelector(".s-item__link")?.href;

      // handle lazy-loaded images with multiple strategies
      let image = null;
      // check for the image element with different class names
      const imgEl =
        el.querySelector(".s-item__image-img") ||
        el.querySelector(".s-item__image img");

      // get attribute "src" or "data-src" or "data-img-src" or "data-image-src"
      if (imgEl) {
        image =
          imgEl.getAttribute("src") ||
          imgEl.getAttribute("data-src") ||
          imgEl.getAttribute("data-img-src") ||
          imgEl.getAttribute("data-image-src");

        // fallback to highest-res image in srcset
        if (
          // check if image is null or contains "1x2.gif"
          (!image || image.includes("1x2.gif")) &&
          // check if imgEl has attribute "srcset"
          imgEl.hasAttribute("srcset")
        ) {
          // split srcset by comma and get the last part
          const srcset = imgEl.getAttribute("srcset");

          // split by comma and get the last part, then trim and split by space
          const best = srcset.split(",").pop()?.trim().split(" ")[0];

          // check if best is not null and does not contain "1x2.gif"
          if (best && !best.includes("1x2.gif")) image = best;
        }
      }

      // fallback: extract image from <noscript> tag if still null
      if (!image) {
        // check if <noscript> tag exists and extract the image from it
        const noscript = el.querySelector("noscript")?.innerHTML;

        // check if noscript is not null and contains <img> tag
        if (noscript) {
          // extract the image from the <img> tag using regex
          const match = noscript.match(/<img.*?src="(.*?)"/i);
          // check if match is not null and contains the image URL
          if (match && match[1] && !match[1].includes("1x2.gif")) {
            // set image to the first capturing group of the regex match
            image = match[1];
          }
        }
      }

      // check if title, price, and link are not null
      if (title && price && link) {
        // push the item to the items array
        items.push({ title, price, link, image, store: "eBay" });
      }
    }

    // return the items array
    return items;
  });

  // close the browser
  await browser.close();

  // log the number of scraped items
  console.log(`scraped ${results.length} items:`);
  // log the scraped items
  console.log(results);

  // return the scraped items
  return results;
};

// run scraper with example query "iphone"
scrapeEbay("iphone")
  .then((scrapedData) => {
    console.log("\nscraped data:");
    scrapedData.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`);
      console.log(`title: ${item.title}`);
      console.log(`price: ${item.price}`);
      console.log(`link: ${item.link}`);
      console.log(`image: ${item.image}`);
      console.log(`store: ${item.store}`);
    });
    console.log("\ndone");
  })
  // catch any errors and log them to the console
  .catch(console.error);
