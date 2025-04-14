// this function automatically scrolls a webpage in batches to load more content.
import delay from "./delay.js"; // this is a utility function that delays execution for a specified number of milliseconds 


// this function automatically scrolls a webpage 
const autoScrollBatch = async (page) => {
  await page.evaluate(async () => {  // evaluate is a method that allows you to run JavaScript code in the context of the page
    await new Promise((resolve) => {  // this creates a new promise 
      let totalScrolled = 0;  // this variable keeps track of the total amount scrolled
      const distance = 200;   // distance to scroll each time
      const scrollCount = 20;   // number of times to scroll
      let scrolls = 0;    // this variable keeps track of the number of scrolls

      const timer = setInterval(() => {  // setInterval is a method that executes a function repeatedly at specified intervals
        window.scrollBy(0, distance);  // this scrolls the window by the specified distance
        totalScrolled += distance;  // this adds the distance to the total scrolled
        scrolls++;  // this increments the number of scrolls

        if (scrolls >= scrollCount) {  // verify if the number of scrolls is greater than or equal to the specified count
          clearInterval(timer);   // this clears the interval to stop scrolling
          resolve();    // this resolves the promise to indicate that scrolling is complete
        }
      }, 100);  // this sets the interval to execute every 100 milliseconds
    });
  });

  await delay(2000);  // this delays the execution for 2 seconds to allow the page to load new content
};

export default autoScrollBatch;
