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
import couponRoutes from './routes/couponRoutes.js'; // Newly added
import wishlistRoutes from './routes/wishlistRoutes.js'; // Newly added
import userRoutes from './routes/userRoutes.js';

import { corsOptions } from './config/cors-options.js';
const PORT = process.env.PORT || 5001;

const app = express();
app.use(express.json());

dotenv.config();
console.log('DATABASE_URL from server.js:', process.env.DATABASE_URL);

// Middleware
app.use(logger);
app.use(cors(corsOptions));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

// Route handlers
app.use('/api/auth', authRoutes); // Public routes
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/price-alerts', authMiddleware, priceAlertRoutes);
app.use('/api/scrapers', authMiddleware, scrapingJobSchema);
app.use('/api/coupons', authMiddleware, couponRoutes); // Newly added
app.use('/api/wishlist', authMiddleware, wishlistRoutes); // Newly added
app.use('/api/users', authMiddleware, userRoutes);

app.use(errorHandler);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`server running on port ${PORT} ->  http://localhost:${PORT}/`));
};
startServer();
