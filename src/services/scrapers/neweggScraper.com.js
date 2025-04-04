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

  const url = `https://www.newegg.com/p/pl?d=${encodeURIComponent(query)}`;

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".item-cell");

  const products = await page.evaluate(() => {
    const items = [];

    document.querySelectorAll(".item-cell").forEach((el) => {
      try {
        const titleEl = el.querySelector(".item-title");
        const link = titleEl?.href || null;
        const title = titleEl?.innerText?.trim() || null;

        const priceWhole = el.querySelector(".price-current strong")?.innerText;
        const priceFraction = el.querySelector(".price-current sup")?.innerText;
        const price = priceWhole
          ? `${priceWhole}${priceFraction ? "." + priceFraction : ""}`
          : "N/A";

        const imgEl = el.querySelector("img");
        let image =
          imgEl?.getAttribute("src") ||
          imgEl?.getAttribute("data-src") ||
          "N/A";

        // clean image URL
        if (image && image.startsWith("//")) image = "https:" + image;

        if (title && link) {
          items.push({ title, price, link, image });
        }
      } catch (err) {
        // silently fail on bad items
      }
    });

    return items;
  });

  await browser.close();
  return products;
};

// run it
scrapeNewegg("iphone").then((items) => {
  console.log(`Scraped ${items.length} items:\n`);
  items.forEach((item, i) => {
    console.log(`#${i + 1}`);
    console.log(`Title: ${item.title}`);
    console.log(`Price: ${item.price}`);
    console.log(`Link: ${item.link}`);
    console.log(`Image: ${item.image}`);
    console.log();
  });
});
