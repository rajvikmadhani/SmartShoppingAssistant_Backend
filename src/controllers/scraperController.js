import express from 'express';

import amazonScraper from '../scrapers/amazonScraper.js';
import ebayScraper from '../scrapers/ebayScraper.js';
const router = express.Router();

router.get('/scrape', async (req, res) => {
    try {
        const productQuery = req.query;
        if (!productQuery.name || !productQuery.brand) {
            return res.status(400).json({ error: 'Missing required product attributes' });
        }

        const product = await ScraperService.fetchProductData(productQuery);
        res.json(product);
    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: 'Failed to scrape product data' });
    }
});

export default router;
