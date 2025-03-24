import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import models from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const { User } = models;
export const register = asyncHandler(async (req, res) => {
    const {
        body: { name, email, password },
    } = req;

    const user = await User.findOne({ email });
    if (user) throw new ErrorResponse('User already exists', 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashedPassword });

    const payload = { id: newUser.id, email: newUser.email, name: newUser.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ user: payload, token });
});

export const login = asyncHandler(async (req, res) => {
    const {
        body: { name, email, password },
    } = req;

    const user = await User.scope('withPassword').findOne({
        where: { email },
    });
    if (!user) throw new ErrorResponse('Invalid credentials', 400);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('isMatch', isMatch);
    if (!isMatch) throw new ErrorResponse('Invalid credentials', 400);

    const payload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ user: payload, token });
});

export const profile = asyncHandler(async (req, res) => {
    const {
        user: { id },
    } = req;

    const user = await User.findByPk(id);
    res.status(200).json(user);
});
