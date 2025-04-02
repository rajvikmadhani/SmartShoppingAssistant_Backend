import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import models from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const { User } = models;

export const register = asyncHandler(async (req, res) => {
    const { name, surname, email, password, street, city, zipcode, about, phone } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) throw new ErrorResponse('User already exists', 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        surname,
        email,
        password: hashedPassword,
        street,
        city,
        zipcode,
        about,
        phone,
    });
    console.log('new user: ', newUser);
    const payload = { id: newUser.id, email: newUser.email, name: newUser.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({ user: payload, token });
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Received email:', email);

    const user = await User.scope('withPassword').findOne({
        where: { email },
    });

    if (!user) {
        console.log('User not found');
        throw new ErrorResponse('Invalid credentials', 400);
    }

    console.log('Found user:', user.email);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        console.log('Password mismatch');
        throw new ErrorResponse('Invalid credentials', 400);
    }

    console.log('Password matched');

    const payload = { id: user.id, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ user: payload, token });
});
