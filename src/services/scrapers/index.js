import { amazonScraper as _amazonScraper } from './amazonScraper.de.js';
import { ebayScraper as _ebayScraper } from './ebayScraper.de.js';
import { mockAmazonScraper } from './mockAmazonScraper.js';
import { mockEbayScraper } from './mockEbayScraper.de.js';
import { filterScrapedResults } from '../../utils/FilterScrappingResult.js';
const isTest = process.env.NODE_ENV === 'test'; // Check if running in test mode

export const amazonScraper = isTest ? mockAmazonScraper : _amazonScraper;
export const ebayScraper = isTest ? mockEbayScraper : mockEbayScraper;
export const filterScrapperResults = isTest ? filterScrapedResults : filterScrapedResults;
