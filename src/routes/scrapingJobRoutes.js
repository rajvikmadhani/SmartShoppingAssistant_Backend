import { Router } from 'express';
import {
    getAllScrapingJobs,
    createScrapingJob,
    updateScrapingJobStatus,
} from '../controllers/scrapingJobController.js';
import validateSchema from '../middleware/validateSchema.js';
import scrapingJobSchema from '../schemas/scrapingJobSchema.js';

const scrapingJobRouter = Router();
scrapingJobRouter.get('/', getAllScrapingJobs);
scrapingJobRouter.post('/', validateSchema(scrapingJobSchema.POST), createScrapingJob);
scrapingJobRouter.put('/:id', validateSchema(scrapingJobSchema.PUT), updateScrapingJobStatus);
export default scrapingJobRouter;
