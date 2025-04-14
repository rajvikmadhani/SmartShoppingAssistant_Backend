// this function loads all products on a page by clicking the "load more" button until no more products can be loaded.

import autoScrollBatch from "./autoScrollBatch.js"; // this is a utility function that scrolls the page to load more products
import delay from "./delay.js"; // this is a utility function that delays execution for a specified number of milliseconds


// this function loads all products on a page by clicking the "load more" button until no more products can be loaded
const loadAllProducts = async (page) => {
  let lastHeight = 0; // this variable keeps track of the last scroll height
  let stuckCount = 0; // this variable keeps track of the number of times the page gets stuck
  const maxStuckCount = 3; // maximum number of times to allow the page to get stuck before stopping the loading process

  // console.log("starting to load all products...");  // log a message indicating the start of the loading process

  while (stuckCount < maxStuckCount) {
    await autoScrollBatch(page); // this function scrolls the page to load more products

    try {
      const loadMoreSelectors = [
        'button:has-text("Mehr anzeigen")',
        'button:has-text("Mehr laden")',
        'button:has-text("Weitere Artikel laden")',
        '[data-testid="loadMoreButton"]',
        'button[class*="loadMore"]',
        '[class*="load-more"]',
      ]; // this is an array of selectors to find the "load more" button

      let buttonFound = false; // this variable keeps track of whether the "load more" button was found
      for (const selector of loadMoreSelectors) {
        // iterate over the selectors
        const loadMoreButton = await page.$(selector); // this finds the "load more" button using the selector
        if (loadMoreButton) {
          // if the button is found
          // console.log(`found "load more" button with selector: ${selector}`);  // log the selector used to find the button
          await loadMoreButton.click(); // this clicks the "load more" button to load more products
          await delay(3000); // this delays the execution for 3 seconds to allow the new products to load
          buttonFound = true; // set the buttonFound variable to true
          break; // exit the loop if the button is found
        }
      }

      if (buttonFound) stuckCount = 0; // reset the stuck count if the button was found
    } catch {
      // console.log("no 'load more' button found or error clicking it"); // this logs a message if no button was found or if there was an error clicking it
    }

    const currentHeight = await page.evaluate(() => document.body.scrollHeight); // this gets the current scroll height of the page
    console.log(`current scroll height: ${currentHeight}px`); // this logs the current scroll height

    if (currentHeight === lastHeight) {
      // if the current height is equal to the last height
      stuckCount++; // this increments the stuck count
      // console.log( `no new content loaded. Attempt ${stuckCount}/${maxStuckCount}`);  // this logs a message indicating that no new content was loaded and the number of attempts made
    } else {
      stuckCount = 0; // this resets the stuck count if new content was loaded
    }

    lastHeight = currentHeight; // this updates the last height to the current height
    await delay(1000);
  }

  console.log("finished loading all products"); // this logs a message indicating the end of the loading process
};

export default loadAllProducts;
