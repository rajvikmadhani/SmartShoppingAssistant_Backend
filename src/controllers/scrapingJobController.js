import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import ScrapingJob from '../models/scrapingJob.js';
import Price from '../models/price.js';
import Notification from '../models/notification.js';
import Coupon from '../models/coupon.js';

// Get all scraping jobs
export const getAllScrapingJobs = asyncHandler(async (req, res, next) => {
    const jobs = await ScrapingJob.findAll();
    res.json(jobs);
});

// Get scraping job by ID
export const getScrapingJobById = asyncHandler(async (req, res, next) => {
    const job = await ScrapingJob.findByPk(req.params.id);
    if (!job) {
        return next(new ErrorResponse('Scraping job not found', 404));
    }
    res.json(job);
});

// Create a new scraping job
export const createScrapingJob = asyncHandler(async (req, res, next) => {
    const { productName, status } = req.body;
    const job = await ScrapingJob.create({ productName, status: status || 'pending' });
    res.status(201).json(job);
});

// Update scraping job status
export const updateScrapingJobStatus = asyncHandler(async (req, res, next) => {
    const job = await ScrapingJob.findByPk(req.params.id);
    if (!job) {
        return next(new ErrorResponse('Scraping job not found', 404));
    }
    job.status = req.body.status || job.status;
    await job.save();
    res.json(job);
});

// Delete a scraping job
export const deleteScrapingJob = asyncHandler(async (req, res, next) => {
    const job = await ScrapingJob.findByPk(req.params.id);
    if (!job) {
        return next(new ErrorResponse('Scraping job not found', 404));
    }
    await job.destroy();
    res.json({ message: 'Scraping job deleted successfully' });
});
