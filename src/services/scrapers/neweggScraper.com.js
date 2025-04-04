import puppeteer from "puppeteer";

const scrapeNewegg = async (query) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
  );

  const results = [];
  let currentPage = 1;

  while (true) {
    const url =
      currentPage === 1
        ? `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}`
        : `https://www.newegg.com/p/pl?d=${encodeURIComponent(
            query
          )}&page=${currentPage}`;

    console.log(`Scraping page ${currentPage}: ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const hasProducts = await page.$(".item-cell");
    if (!hasProducts) {
      console.log("No more product listings found. Stopping.");
      break;
    }

    await page.waitForSelector(".item-cell", { timeout: 10000 });

    const products = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll(".item-cell").forEach((el) => {
        try {
          const titleEl = el.querySelector(".item-title");
          const link = titleEl?.href || null;
          const title = titleEl?.innerText?.trim() || null;

          const priceWhole = el.querySelector(
            ".price-current strong"
          )?.innerText;
          const priceFraction =
            el.querySelector(".price-current sup")?.innerText;
          const price = priceWhole
            ? `${priceWhole}${priceFraction ? "." + priceFraction : ""}`
            : "N/A";

          const imgEl = el.querySelector("img");
          let image =
            imgEl?.getAttribute("src") ||
            imgEl?.getAttribute("data-src") ||
            "N/A";
          if (image && image.startsWith("//")) image = "https:" + image;

          const ratingEl = el.querySelector(".item-rating");
          const rating = ratingEl?.title || "N/A";

          const reviewsEl = el.querySelector(".item-rating-num");
          const reviews = reviewsEl
            ? reviewsEl.innerText.replace(/[()]/g, "")
            : "N/A";

          const shippingEl = el.querySelector(".price-ship");
          const shipping = shippingEl?.innerText?.trim() || "N/A";

          if (title && link) {
            items.push({
              title,
              price,
              link,
              image,
              rating,
              reviews,
              shipping,
            });
          }
        } catch (err) {
          // Skip faulty product
        }
      });
      return items;
    });

    results.push(...products);
    console.log(`Found ${products.length} items on page ${currentPage}`);

    // Check if there is a next page by looking for the active page button and checking if a higher number exists
    const isLastPage = await page.evaluate((currentPage) => {
      const paginationButtons = Array.from(
        document.querySelectorAll(".list-tool-pagination .btn")
      );
      return !paginationButtons.some((btn) => {
        const pageNum = parseInt(btn.innerText);
        return !isNaN(pageNum) && pageNum > currentPage;
      });
    }, currentPage);

    if (isLastPage) {
      console.log("Reached last page.");
      break;
    }

    currentPage++;
  }

  await browser.close();
  return results;
};

// Usage
scrapeNewegg("iphone").then((items) => {
  console.log(`\nScraped ${items.length} total items:\n`);
  items.forEach((item, index) => {
    console.log(`#${index + 1}`);
    console.log(`title   : ${item.title}`);
    console.log(`price   : ${item.price}`);
    console.log(`link    : ${item.link}`);
    console.log(`image   : ${item.image}`);
    console.log(`rating  : ${item.rating}`);
    console.log(`reviews : ${item.reviews}`);
    console.log(`shipping: ${item.shipping}\n`);
  });
});
