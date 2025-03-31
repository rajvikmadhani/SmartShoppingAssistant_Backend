import puppeteer from "puppeteer"; // import the puppeteer library

// function to scrape eBay for a given query
const scrapeEbay = async (query) => {
  // options for browser launch
  // headless: true for production, false for debugging
  // args: ["--no-sandbox", "--disable-setuid-sandbox"] for Linux environments
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

  // set a custom referer to mimic a real browser
  const searchUrl = `https://www.ebay.de/sch/i.html?_nkw=${encodeURIComponent(
    query
  )}`;

  // navigate to the search URL
  console.log(`scraping eBay: ${searchUrl}`);

  // wait for the page to load and the DOM to be ready
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
  // wait for the search results to load
  await page.waitForSelector(".s-item");

  // evaluate the page to scroll and trigger lazy-loaded images
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  // wait for lazy-loaded images to load
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // wait for the search results to load again
  const results = await page.evaluate(() => {
    // select the items from the search results
    const items = [];

    // select all elements with the class "s-item"
    const elements = document.querySelectorAll(".s-item");

    // loop through the elements and extract the title, price, link, and image
    for (let i = 0; i < elements.length; i++) {
      // element loop
      const el = elements[i];

      // title, price, link, image, shipping, condition, location
      const title = el.querySelector(".s-item__title")?.innerText;
      const price = el.querySelector(".s-item__price")?.innerText;
      const link = el.querySelector(".s-item__link")?.href;
      const shipping = el.querySelector(".s-item__shipping")?.innerText;
      const condition = el.querySelector(".SECONDARY_INFO")?.innerText;
      const location = el.querySelector(".s-item__location")?.innerText;

      // check if the element is a valid item
      let image = null;

      // check for image element
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
          (!image || image.includes("1x2.gif")) &&
          imgEl.hasAttribute("srcset")
        ) {
          // check if srcset is present and split it to get the best image
          const srcset = imgEl.getAttribute("srcset");
          // split srcset by comma and get the last part
          const best = srcset.split(",").pop()?.trim().split(" ")[0];
          // check if best is not null and does not contain "1x2.gif"
          if (best && !best.includes("1x2.gif")) image = best;
        }
      }

      // fallback to noscript tag if image is not found
      if (!image) {
        // check if <noscript> tag exists and extract the image from it
        const noscript = el.querySelector("noscript")?.innerHTML;

        if (noscript) {
          // match the image from the <noscript> tag using regex
          const match = noscript.match(/<img.*?src="(.*?)"/i);
          // check if march is not null and contains the image URL and contain "1x2.gif"
          if (match && match[1] && !match[1].includes("1x2.gif")) {
            // set image to the matched URL
            image = match[1];
          }
        }
      }

      // check if title, price, and link are not null
      if (title && price && link) {
        // check if image is not null and does not contain "1x2.gif"
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
    // log done message
    console.log("\ndone");
  })
  // catch any errors and log them
  .catch(console.error);
