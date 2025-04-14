// setTimeout for a promise to delay execution
// this function returns a promise that resolves after a specified number of milliseconds
// this is useful to avoid overwhelming the server with requests
// and to prevent being blocked by the website
// the delay time is passed as an argument in milliseconds
// for example, delay(5000) will pause execution for 5 second

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default delay;
