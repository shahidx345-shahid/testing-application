import express, { Response } from 'express';
import { User } from '../models/auth.model';
import { connectDB } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, updateAvatarSchema } from '../schemas/profile.schema';
import { cacheGetJSON, cacheSetJSON, cacheDelete } from '../config/redis';
import bcrypt from 'bcryptjs';

const router = express.Router();

// GET /api/profile - Get user profile (with caching)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();

        // Try cache first
        const cacheKey = `profile:${req.userId}`;
        const cached = await cacheGetJSON(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                data: cached,
                cached: true
            });
        }

        const user = await User.findById(req.userId).select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Cache for 5 minutes
        await cacheSetJSON(cacheKey, user, 300);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get profile'
        });
    }
});

// PUT /api/profile - Update user profile
router.put('/', authenticateToken, validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();

        const { firstName, lastName, phoneNumber, dateOfBirth, address, bio, preferences } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
        if (address) user.address = address;
        if (bio) user.bio = bio;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        // Invalidate cache
        await cacheDelete(`profile:${req.userId}`);

        // Return updated user without password
        const updatedUser = await User.findById(req.userId).select('-passwordHash');

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
});

// PUT /api/profile/avatar - Update profile picture
router.put('/avatar', authenticateToken, validate(updateAvatarSchema), async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();
        const { avatarUrl } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.profileImage = avatarUrl;
        await user.save();

        // Invalidate cache
        await cacheDelete(`profile:${req.userId}`);

        res.json({
            success: true,
            data: { profileImage: avatarUrl }
        });

    } catch (error) {
        console.error('Update avatar error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update avatar'
        });
    }
});

// POST /api/profile/change-password - Change user password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: 'New passwords do not match'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters'
            });
        }

        // Get user with password
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.passwordHash = hashedPassword;
        await user.save();

        // Invalidate cache
        await cacheDelete(`profile:${req.userId}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
});

export default router;
