import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const { User } = models;

const authMiddleware = async (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    // Token Extraction
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Token Validation
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        // User Fetching
        req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        // Error Handling
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;
