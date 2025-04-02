// Handles product-specific search & scraping
const fetchProductData = async (productQuery, manualTrigger = false) => {
    const { brand, name, storage_gb, ram_gb, color } = productQuery;

    // Check if the product exists in DB
    let product = await models.Product.findOne({
        where: { brand, name, storage_gb, ram_gb, color },
        include: [{ model: models.Price }],
    });

    let shouldScrape = manualTrigger; // Force scrape if triggered manually
    if (!product) {
        shouldScrape = true;
    } else {
        const latestPrice = await models.Price.findOne({
            where: { productId: product.id },
            order: [['lastUpdated', 'DESC']],
        });

        if (!latestPrice || new Date() - latestPrice.lastUpdated > 24 * 60 * 60 * 1000) {
            shouldScrape = true;
        }
    }

    if (shouldScrape) {
        // Create scraping job entry
        const scrapingJob = await models.ScrapingJob.create({
            productId: product?.id || null,
            storeId: null, // Scraping multiple stores
            status: 'in_progress',
            startedAt: new Date(),
        });

        try {
            const [amazonResults, ebayResults] = await Promise.all([
                amazonScraper(productQuery),
                ebayScraper(productQuery),
            ]);

            const updatedProduct = await this.updateDatabase(product, amazonResults.concat(ebayResults));

            // Mark job as completed
            await scrapingJob.update({
                status: 'completed',
                completedAt: new Date(),
            });

            return updatedProduct;
        } catch (error) {
            // Mark job as failed
            await scrapingJob.update({
                status: 'failed',
                errorMessage: error.message,
                completedAt: new Date(),
            });
            throw error;
        }
    }

    return product;
};
export default fetchProductData;
