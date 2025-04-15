import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import delay from "./utils/delay.js";

puppeteer.use(StealthPlugin());

const scrapeMediaMarkt = async (query = "iphone 15") => {
  console.log(`starting scrape for "${query}"...`);

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
    args: ["--no-sandbox", "--window-size=1920,1080"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "Accept-Language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Cache-Control": "max-age=0",
      Referer: "https://www.google.com/",
    });

    // set consent cookie
    await page.setCookie({
      name: "consent",
      value: "accepted",
      domain: ".mediamarkt.de",
      path: "/",
    });

    const searchUrl = `https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(
      query
    )}`;
    console.log(`navigating to: ${searchUrl}`);

    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await delay(3000);

    // accept cookies if dialog appears
    try {
      const cookieSelector =
        'button[data-test="consent-accept-all"], [class*="cookie"] button';
      const cookieButton = await page.$(cookieSelector);
      if (cookieButton) {
        await cookieButton.click();
        await delay(2000);
      }
    } catch (error) {
      console.log("no cookie notice found or error clicking it");
    }

    // auto-scroll to load more products
    console.log("starting page scrolling...");
    let previousHeight = 0;
    let scrollAttempts = 0;

    while (scrollAttempts < 10) {
      scrollAttempts++;
      previousHeight = await page.evaluate(() => document.body.scrollHeight);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await delay(2000);

      // try clicking "Load More" button if it exists
      try {
        const loadMoreButton = await page.$(
          'button[data-test="load-more-button"], [class*="loadMore"]'
        );
        if (loadMoreButton) {
          await loadMoreButton.click();
          await delay(2000);
        }
      } catch (e) {
        // ignore errors
      }

      const currentHeight = await page.evaluate(
        () => document.body.scrollHeight
      );
      if (currentHeight === previousHeight && scrollAttempts > 3) {
        console.log("no more content loading, finishing scroll");
        break;
      }
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(1000);

    // extract products
    const products = await page.evaluate(() => {
      const items = [];

      // helper function to extract price
      function extractPrice(text) {
        if (!text) return "0.00";

        const patterns = [
          /(\d+[.,]\d+)\s*€/, // 123,45 €
          /€\s*(\d+[.,]\d+)/, // € 123,45
          /(\d+[.,]\d+)\s*EUR/i, // 123,45 EUR
          /(\d+[.,]\d+)/, // Any number with decimal
        ];

        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            return match[1].replace(",", ".");
          }
        }

        const numberMatch = text.match(/\d+/);
        return numberMatch ? numberMatch[0] + ".00" : "0.00";
      }

      // find product elements
      const productSelectors = [
        '[data-test="mms-search-srp-productlist-item"]',
        ".product-wrapper",
        ".product-card",
        ".product-tile",
        '[class*="ProductTile"]',
        "article",
        '[class*="productCard"]',
      ];

      let products = [];
      for (const selector of productSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          products = Array.from(elements);
          break;
        }
      }

      // if no products found with selectors
      if (products.length === 0) {
        const allElements = document.querySelectorAll("*");
        products = Array.from(allElements).filter(
          (el) =>
            el.tagName.toLowerCase() !== "html" &&
            el.tagName.toLowerCase() !== "body" &&
            (el.textContent.includes("€") ||
              el.textContent.toLowerCase().includes("eur")) &&
            el.querySelector("img") &&
            el.querySelector("a")
        );
      }

      // process each product
      products.forEach((product, index) => {
        try {
          // extract title
          let title = null;
          const titleSelectors = [
            ".product-name",
            ".product-title",
            '[class*="title"]',
            '[class*="Title"]',
            "h3",
            "h2",
            "a[title]",
            "img[alt]",
          ];

          for (const selector of titleSelectors) {
            const element = product.querySelector(selector);
            if (element) {
              if (selector === "a[title]") {
                title = element.getAttribute("title");
              } else if (selector === "img[alt]") {
                title = element.getAttribute("alt");
              } else {
                title = element.textContent.trim();
              }

              if (title && title.length > 3) break;
            }
          }

          title = title || `Produkt ${index + 1}`;

          // extract price using text nodes containing € or EUR
          let price = "0.00";

          const textNodesWithPrice = [];
          const walker = document.createTreeWalker(
            product,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let node;
          while ((node = walker.nextNode())) {
            const text = node.nodeValue.trim();
            if (
              text &&
              (text.includes("€") || text.toLowerCase().includes("eur"))
            ) {
              textNodesWithPrice.push(text);
            }
          }

          for (const text of textNodesWithPrice) {
            const extracted = extractPrice(text);
            if (extracted !== "0.00") {
              price = extracted;
              break;
            }
          }

          if (price === "0.00") {
            const priceSelectors = [
              ".price",
              '[data-test="price"]',
              '[class*="price"]',
              '[class*="Price"]',
              '[class*="Preis"]',
              '[itemprop="price"]',
            ];

            for (const selector of priceSelectors) {
              const elements = product.querySelectorAll(selector);
              for (const el of elements) {
                const text = el.textContent.trim();
                if (
                  text &&
                  (text.includes("€") || text.toLowerCase().includes("eur"))
                ) {
                  const extracted = extractPrice(text);
                  if (extracted !== "0.00") {
                    price = extracted;
                    break;
                  }
                }
              }
              if (price !== "0.00") break;
            }
          }

          let link = "";
          const linkElement = product.querySelector("a");
          if (linkElement) {
            link = linkElement.href;
            if (!link.startsWith("http")) {
              link = link.startsWith("/")
                ? `https://www.mediamarkt.de${link}`
                : `https://www.mediamarkt.de/${link}`;
            }
          }

          let image = "";
          const img = product.querySelector("img");
          if (img) {
            image =
              img.src ||
              img.getAttribute("data-src") ||
              img.getAttribute("srcset")?.split(" ")[0] ||
              "";
          }

          if (price !== "0.00") {
            items.push({
              title,
              price,
              link,
              image,
              currency: "€",
              brand: "Unknown",
              availability: "In Stock",
              storage_gb: 0,
              ram_gb: 0,
              ramMatch: 0,
              rating: null,
              shippingCost: "0.00",
              discount: 0,
              seller: "MediaMarkt",
              productSellerRate: 0,
              badge: "Unknown",
              isPrime: false,
              delivery: "Standard delivery",
              store: "MediaMarkt",
              seller_rating: 0,
            });
          }
        } catch (error) {
          console.log(
            `error processing product ${index + 1}: ${error.message}`
          );
        }
      });

      return items;
    });

    console.log(`successfully extracted ${products.length} products`);
    return products;
  } catch (error) {
    console.error("scraping error:", error);
    throw error;
  } finally {
    await browser.close();
  }
};

// example usage
scrapeMediaMarkt("iphone")
  .then((scrapedData) => {
    console.log("\nscraped data:");

    const topItems = scrapedData.slice(0, 59);
    topItems.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`);
      console.log(`title: ${item.title}`);
      console.log(`price: ${item.price} ${item.currency}`);
      console.log(`link: ${item.link}`);
      console.log(`image: ${item.image}`);
      console.log(`brand: ${item.brand}`);
      console.log(`availability: ${item.availability}`);
      console.log(`storage_gb: ${item.storage_gb}`);
      console.log(`ram_gb: ${item.ram_gb}`);
      console.log(`ramMatch: ${item.ramMatch}`);
      console.log(`rating: ${item.rating}`);
      console.log(`shippingCost: ${item.shippingCost}`);
      console.log(`discount: ${item.discount}`);
      console.log(`seller: ${item.seller}`);
      console.log(`productSellerRate: ${item.productSellerRate}`);
      console.log(`badge: ${item.badge}`);
      console.log(`isPrime: ${item.isPrime}`);
      console.log(`delivery: ${item.delivery}`);
      console.log(`store: ${item.store}`);
      console.log(`seller_rating: ${item.seller_rating}`);
    });

    console.log(`\ntotal products found: ${scrapedData.length}`);
  })
  .catch(console.error);
