import models from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

const { User } = models;

/**
 * Get the currently logged-in user's details
 * Route: GET /api/users/me
 * Protected: Yes (Requires authentication)
 */
export const getUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.user;
    console.log('User ID:', id);
    console.log('User:', req.user);

    const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }, // Exclude password
    });

    if (!user) throw new ErrorResponse('User not found', 404);

    res.status(200).json(user);
});

/**
 * Get user by ID (Admin only)
 * Route: GET /api/users/:id
 * Protected: Yes (Requires Admin role)
 */
export const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log('User ID:', id);
    console.log('User:', req.user);
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }, // Exclude password
    });

    if (!user) throw new ErrorResponse('User not found', 404);

    res.status(200).json(user);
});

/**
 * Update user profile
 * Route: PUT /api/users/me
 * Protected: Yes (Requires authentication)
 */
export const updateUserProfile = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { name, surname, email, street, city, zipcode, about, phone } = req.body;

    const user = await User.findByPk(id);
    if (!user) throw new ErrorResponse('User not found', 404);

    user.name = name || user.name;
    user.surname = surname || user.surname;
    user.email = email || user.email;
    user.street = street || user.street;
    user.city = city || user.city;
    user.zipcode = zipcode || user.zipcode;
    user.about = about || user.about;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
});

/**
 * Delete user account
 * Route: DELETE /api/users/me
 * Protected: Yes (Requires authentication)
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const user = await User.findByPk(id);
    if (!user) throw new ErrorResponse('User not found', 404);

    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
});
