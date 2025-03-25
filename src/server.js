import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './db/index.js';
//Middleware
import cors from 'cors';
import helmet from 'helmet';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
//import routes
import authRoutes from './routes/authRoutes.js';

//
import { corsOptions } from './config/cors-options.js';
const PORT = process.env.PORT || 5001;

const app = express();
app.use(express.json());

dotenv.config();
console.log('DATABASE_URL from server.js:', process.env.DATABASE_URL);

// middleware
app.use(logger);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// Route handlers
app.use('/api/auth', authRoutes);

app.use(errorHandler);

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`server running on port ${PORT} ->  http://localhost:${PORT}/`));
};
startServer();
