import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import delay from "../../utils/delay.js";
import autoScrollBatch from "../../utils/autoScrollBatch.js"; // this is a utility function that scrolls the page to load more products
import loadAllProducts from "../../utils/loadAllProducts.js"; // this is a utility function that loads all products on the page

puppeteer.use(StealthPlugin());

const scraperOtto = async (query = "iphone 15") => {
  console.log(`starting scrape for "${query}"...`);

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--no-sandbox"],
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
      Referer: "https://www.google.com/",
    });

    const searchUrl = `https://www.otto.de/suche/${encodeURIComponent(query)}`;
    console.log(`navigating to search URL: ${searchUrl}`);

    await page.goto(searchUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await delay(3000);
    await loadAllProducts(page);

    const products = await page.evaluate(async () => {
      const items = [];
      const tileSelectors = [
        '[data-testid="productTile"]',
        ".p_results__tile",
        ".js_tile",
        ".product-tiles-container > div",
        '[class*="product-tile"]',
        '[class*="productTile"]',
        '[class*="articleTile"]',
        ".search-result-article",
        'article[class*="product"]',
      ];

      let productElements = [];
      for (const selector of tileSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          productElements = Array.from(elements);
          break;
        }
      }

      for (let i = 0; i < productElements.length; i++) {
        try {
          const product = productElements[i];
          const title =
            product
              .querySelector('[data-testid="product-title"]')
              ?.textContent.trim() ||
            product.querySelector('[class*="title"]')?.textContent.trim() ||
            product.querySelector("h3")?.textContent.trim() ||
            product.querySelector("h2")?.textContent.trim() ||
            product.querySelector("a")?.getAttribute("title") ||
            product.querySelector("img")?.getAttribute("alt") ||
            `Produkt ${i + 1}`;

          const priceElement =
            product.querySelector('[data-testid="product-price"]') ||
            product.querySelector('[class*="price"]');

          let price = "0.00";
          if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const priceMatch = priceText.match(/(\d+[.,]\d+)\s*€/);
            if (priceMatch) {
              price = priceMatch[1].replace(",", ".");
            }
          }

          const link = product.querySelector("a")?.href || "";
          const imgEl = product.querySelector("img");
          const image =
            imgEl?.getAttribute("src") ||
            imgEl?.getAttribute("data-src") ||
            imgEl?.getAttribute("srcset")?.split(" ")[0] ||
            "";

          const availabilityElement = product.querySelector(
            '[class*="availability"], [data-testid*="availability"], [class*="stock"]'
          );
          const availability = availabilityElement?.textContent
            .toLowerCase()
            .includes("nicht")
            ? "Out of Stock"
            : "In Stock";

          const shippingElement = product.querySelector(
            '[class*="shipping"], [class*="versand"]'
          );
          const shippingText = shippingElement?.textContent || "";
          const shippingCostMatch = shippingText.match(/(\d+[.,]\d+)\s*€/);
          const shippingCost = shippingCostMatch
            ? shippingCostMatch[1].replace(",", ".")
            : "0.00";

          const deliveryElement = product.querySelector(
            '[class*="delivery"], [class*="lieferung"]'
          );
          const delivery =
            deliveryElement?.textContent.trim() || "Free delivery";

          const discountElement = product.querySelector(
            '[class*="discount"], [class*="sale"]'
          );
          let discount = 0;

          if (discountElement) {
            const discountText = discountElement.textContent.trim();
            const match = discountText.match(/(\d+)%/);
            if (match) {
              discount = parseInt(match[1]);
            }
          }

          items.push({
            title,
            price,
            currency: "€",
            brand: "Unknown",
            availability,
            storage_gb: 0,
            ram_gb: 0,
            ramMatch: 0,
            rating: null,
            shippingCost,
            discount: discount || 0,
            link,
            image,
            seller: "Otto",
            productSellerRate: 0,
            badge: "Unknown",
            isPrime: false,
            delivery,
            store: "Otto",
            seller_rating: 0,
          });
        } catch (error) {
          console.log(`error processing product ${i + 1}: ${error.message}`);
        }
      }

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

scraperOtto("iphone")
  .then((scrapedData) => {
    console.log("\nscraped data:");

    // slice the first items
    const top3 = scrapedData.slice(0, 3);

    top3.forEach((item, i) => {
      console.log(`\nitem ${i + 1}`);
      console.log(`title: ${item.title}`);
      console.log(`price: ${item.price}`);
      console.log(`currency: ${item.currency}`);
      console.log(`brand: ${item.brand}`);
      console.log(`availability: ${item.availability}`);
      console.log(`storage_gb: ${item.storage_gb}`);
      console.log(`ram_gb: ${item.ram_gb}`);
      console.log(`ramMatch: ${item.ramMatch}`);
      console.log(`rating: ${item.rating}`);
      console.log(`shippingCost: ${item.shippingCost}`);
      console.log(`discount: ${item.discount}`);
      console.log(`link: ${item.link}`);
      console.log(`image: ${item.image}`);
      console.log(`seller: ${item.seller}`);
      console.log(`productSellerRate: ${item.productSellerRate}`);
      console.log(`badge: ${item.badge}`);
      console.log(`isPrime: ${item.isPrime}`);
      console.log(`delivery: ${item.delivery}`);
      console.log(`store: ${item.store}`);
      console.log(`seller_rating: ${item.seller_rating}`);
    });

    console.log("\ndone");
  })
  .catch(console.error);
