import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './db/index.js';
// Middleware
import cors from 'cors';
import helmet from 'helmet';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authMiddleware from './middleware/authMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import priceAlertRoutes from './routes/priceAlertRoutes.js';
import scrapingJobSchema from './routes/scrapingJobRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import liveDataRoutes from './routes/liveDataRoutes.js';
import priceHistoryRouter from './routes/priceHistory.js';

import { corsOptions } from './config/cors-options.js';
const PORT = process.env.PORT || 5001;

const app = express();
app.use(express.json());

dotenv.config();
//console.log('DATABASE_URL from server.js:', process.env.DATABASE_URL);

// Middleware
app.use(logger);
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
//sanity check
app.get('/', (req, res) => {
    res.status(200).send('Server is up and running');
});

// Route handlers
app.use('/api/auth', authRoutes); // Public routes

// app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/products', productRoutes);

// app.use('/api/liveData', authMiddleware, liveDataRoutes);
app.use('/api/liveData', liveDataRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/price-alerts', authMiddleware, priceAlertRoutes);
app.use('/api/price-history', authMiddleware, priceHistoryRouter);
app.use('/api/scrapingJob', authMiddleware, scrapingJobSchema);
app.use('/api/coupons', authMiddleware, couponRoutes);
app.use('/api/wishlist', authMiddleware, wishlistRoutes);
app.use('/api/users', authMiddleware, userRoutes);

app.use(errorHandler);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`server running on port ${PORT} ->  http://localhost:${PORT}/`));
};
startServer();

// export the app for Supertest (IMPORTANT)
export default app;
