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
scrapingJobRouter.post('/', validateSchema(scrapingJobSchema), createScrapingJob);
scrapingJobRouter.put('/:id', validateSchema(scrapingJobSchema), updateScrapingJobStatus);
export default scrapingJobRouter;
