// Handles scheduled background scraping
// Schedule the scraping job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled scraping task...');
    await ScraperService.runScheduledScraping();
});
