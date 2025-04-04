import puppeteer from "puppeteer"; // import puppeteer for web scraping

// function to scrape Newegg for a given query
const scrapeNewegg = async (query) => {
  // launch a new browser instance with more realistic settings
  const browser = await puppeteer.launch({
    headless: "new", // Use non-headless to better evade detection
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  // create a new page in the browser
  const page = await browser.newPage();

  // set a more realistic user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
  );

  try {
    // set the search URL with the query
    const searchUrl = `https://www.newegg.com/p/pl?d=${encodeURIComponent(
      query
    )}`;

    // console log the search URL
    console.log(`scraping Newegg: ${searchUrl}`);

    // navigate to the search URL and wait until network is mostly idle
    await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout: 60000, // Increase timeout to 60 seconds
    });

    // wait for content to load - try multiple potential selectors
    const possibleSelectors = [
      ".item-cell",
      ".item-container",
      ".product-item",
      ".product-details",
      ".product-main",
    ];

    const validSelector = await findValidSelector(page, possibleSelectors);
    if (!validSelector) {
      throw new Error("could not find any product selectors on the page");
    }

    // extract data from the page using the found selector
    const results = await page.evaluate((selector) => {
      const items = [];
      const elements = document.querySelectorAll(selector);

      console.log(`found ${elements.length} items on the page`);

      for (let i = 0; i < elements.length && items.length < 10; i++) {
        try {
          const el = elements[i];

          // try different selectors for title
          let title = null;
          const titleSelectors = [
            ".item-title",
            ".product-title",
            "a.title",
            "a[title]",
          ];
          for (const s of titleSelectors) {
            const elem = el.querySelector(s);
            if (elem) {
              title = elem.textContent.trim();
              break;
            }
          }

          // try different selectors for price
          let price = "N/A";
          const priceSelectors = [".price-current", ".price", ".product-price"];
          for (const s of priceSelectors) {
            const priceElem = el.querySelector(s);
            if (priceElem) {
              price = priceElem.textContent.trim();
              break;
            }
          }

          // try different selectors for discount
          let discount = "N/A";
          const discountSelectors = [".price-save", ".price-was"];
          for (const s of discountSelectors) {
            const discountElem = el.querySelector(s);
            if (discountElem) {
              discount = discountElem.textContent.trim();
              break;
            }
          }

          // try different selectors for link
          let link = null;
          const linkSelectors = [
            ".item-title",
            ".product-title",
            "a.title",
            ".item-img",
          ];
          for (const s of linkSelectors) {
            const elem = el.querySelector(s);
            if (elem && elem.href) {
              link = elem.href;
              break;
            }
          }

          // try different selectors for image
          let image = null;
          const imageSelectors = [
            ".item-img img",
            ".product-image img",
            ".item-image img",
          ];
          for (const s of imageSelectors) {
            const imageElem = el.querySelector(s);
            if (imageElem && imageElem.src) {
              image = imageElem.src;
              break;
            }
          }

          // try different selectors for rating
          let rating = "N/A";
          const ratingSelectors = [
            ".item-rating",
            ".product-rating",
            ".rating",
          ];
          for (const s of ratingSelectors) {
            const ratingElem = el.querySelector(s);
            if (ratingElem) {
              rating =
                ratingElem.getAttribute("title") ||
                ratingElem.textContent.trim();
              break;
            }
          }

          // try different selectors for reviews
          let reviews = "N/A";
          const reviewsSelectors = [
            ".item-rating-num",
            ".product-reviews",
            ".reviews",
          ];
          for (const s of reviewsSelectors) {
            const reviewsElem = el.querySelector(s);
            if (reviewsElem) {
              reviews = reviewsElem.textContent.trim();
              break;
            }
          }

          if (title && link) {
            items.push({
              title,
              price,
              discount,
              link,
              image,
              rating,
              reviews,
              store: "Newegg",
            });
          }
        } catch (err) {
          console.log(`error processing item: ${err.message}`);
        }
      }
      return items;
    }, validSelector);

    console.log(`scraped ${results.length} items:`);
    console.log(results);
    return results;
  } catch (error) {
    console.error(`scraping error: ${error.message}`);

    return;
  } finally {
    // close the browser instance
    await browser.close();
  }
};

// helper function to find a valid selector
async function findValidSelector(page, selectors) {
  for (const selector of selectors) {
    try {
      // try to find at least one element with this selector (timeout: 5s)
      const element = await page
        .waitForSelector(selector, { timeout: 5000 })
        .catch(() => null);

      if (element) {
        return selector;
      }
    } catch (error) {
      console.log(`selector ${selector} not found`);
    }
  }
  return null;
}

// run scraper for iphone
scrapeNewegg("iphone")
  .then((results) => {
    if (results.length > 0) {
      console.log("successfully scraped items");
    } else {
      console.log("no items were scraped");
    }
    console.log("done");
  })
  .catch(console.error);
