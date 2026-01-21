import express, { Request, Response } from 'express';
import { User, EmailVerification, OTPVerification, PasswordReset } from '../models/auth.model';
import { Wallet } from '../models/wallet.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
    validateEmail,
    validatePassword,
    validatePhoneNumber,
    generateEmailVerificationCode,
    generateOTP,
    generatePasswordResetToken,
    hashCode,
    verifyCode,
    sendEmailVerification,
    sendOTPEmail,
    sendPasswordResetEmail,
    checkRateLimit,
    resetRateLimit,
} from '../utils/auth-utils';
import {
    generateAccessToken,
    createRefreshToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens
} from '../utils/token-utils';
import { connectDB } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { signupSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema';
import { authLimiter, requestPasswordResetLimiter } from '../middleware/rate-limiters';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cookie options for httpOnly cookies
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Simple UUID generator
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// POST /api/auth/signup
router.post('/signup', authLimiter, validate(signupSchema), async (req: Request, res: Response) => {
    try {
        await connectDB();

        const { email, password, firstName, selectedChallenge, multiplier } = req.body;

        // Custom validation logic removed as Zod handles structure, but business logic remains
        // (Removing redundant manual checks that Zod covers)

        // Internal business logic validation (e.g. rate limit check using redis/utils) can stay if needed, 
        // but 'authLimiter' middleware now handles IP rate limiting.

        // ... existing logic ...

        // Keeping simple validation just in case Zod missed something (unlikely) or for specific errors
        // Actually, I should remove the redundant manual checks to clean up code as requested "Optimize"
        // But the prompt says "Keep all API routes... exactly as they are". removing code inside might change behavior if error messages differ.
        // Zod returns "Email is required" etc.
        // The existing code returns { error: "Email, password... required" }.
        // I will keep the existing manual checks for mostly backward compatibility message-wise, or just let Zod handle it.
        // I'll keep the function body mostly as is, just injected middleware.

        // Validate required fields (Redundant but safe)
        if (!email || !password || !firstName) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and firstName are required'
            });
        }

        // Validate email
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid email address'
            });
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: passwordValidation.errors.join('. ')
            });
        }

        // Rate limiting
        if (!checkRateLimit(`signup_${email}`, 5, 60 * 60 * 1000)) {
            return res.status(429).json({
                success: false,
                error: 'Too many signup attempts. Please try again later.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Create new user
        const userId = uuidv4();
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            userId: userId,
            email: email.toLowerCase(),
            firstName: firstName,
            lastName: firstName,
            passwordHash: hashedPassword,
            referralCode: referralCode,
            emailVerified: false,
            accountStatus: 'active',
        });

        await user.save();

        // Determine daily saving amount
        let dailySavingAmount = 27.4;
        if (selectedChallenge === 'weekly') {
            dailySavingAmount = 191.80 / 7;
        } else if (selectedChallenge === 'monthly') {
            dailySavingAmount = 849.40 / 30;
        }

        if (multiplier) {
            dailySavingAmount *= multiplier;
        }

        // Create wallet
        await Wallet.create({
            userId: user._id.toString(),
            balance: 0,
            availableBalance: 0,
            locked: 0,
            lockedInPockets: 0,
            referralEarnings: 0,
            currentStreak: 0,
            dailySavingAmount: dailySavingAmount,
        });

        // Generate verification code
        const verificationCode = generateEmailVerificationCode();
        const verificationHash = hashCode(verificationCode);

        await EmailVerification.create({
            userId: user._id,
            email: email.toLowerCase(),
            code: verificationCode,
            codeHash: verificationHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        // Send verification email
        await sendEmailVerification(email, verificationCode);

        res.status(201).json({
            success: true,
            message: 'Account created successfully. Please verify your email.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                },
                requiresEmailVerification: true,
                verificationCodeSent: true,
            },
        });
    } catch (error: any) {
        console.error('Signup error:', error);

        if (error.message?.includes('E11000')) {
            if (error.message.includes('phoneNumber')) {
                return res.status(500).json({
                    success: false,
                    error: 'Database index issue. Please contact support.'
                });
            }
            if (error.message.includes('email')) {
                return res.status(409).json({
                    success: false,
                    error: 'Email already registered'
                });
            }
        }

        res.status(500).json({
            success: false,
            error: 'An error occurred during signup. Please try again.'
        });
    }
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
    try {
        await connectDB();

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: email, password'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        if (user.accountStatus !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Account has been deactivated. Please contact support.'
            });
        }

        if (user.accountStatus === 'locked') {
            return res.status(429).json({
                success: false,
                error: 'Account is locked. Please try again later.'
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            user.lastFailedLogin = new Date();

            if (user.failedLoginAttempts >= 5) {
                user.accountStatus = 'locked';
            }

            await user.save();
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        user.failedLoginAttempts = 0;
        user.accountStatus = 'active';
        user.lastLogin = new Date();
        await user.save();

        // Generate access token (short-lived)
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
        });

        // Generate refresh token (long-lived)
        const ipAddress = req.ip || req.socket.remoteAddress;
        const refreshTokenData = await createRefreshToken(user._id.toString(), ipAddress);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshTokenData.token, cookieOptions);

        // Calculate expiry time (15 minutes from now)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    accountStatus: user.accountStatus,
                },
                session: {
                    id: `session_${user._id.toString()}_${Date.now()}`,
                    accessToken,
                    refreshToken: refreshTokenData.token,
                    expiresAt: expiresAt.toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to login'
        });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();

        const user = await User.findById(req.userId).select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            const ipAddress = req.ip || req.socket.remoteAddress;
            await revokeRefreshToken(refreshToken, ipAddress);
        }

        // Clear refresh token cookie
        res.clearCookie('refreshToken', cookieOptions);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        });
    }
});

// POST /api/auth/refresh - Refresh access token using refresh token
router.post('/refresh', async (req: Request, res: Response) => {
    try {
        await connectDB();

        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token required'
            });
        }

        // Verify refresh token
        const verification = await verifyRefreshToken(oldRefreshToken);

        if (!verification.valid || !verification.userId) {
            return res.status(401).json({
                success: false,
                error: verification.message || 'Invalid refresh token'
            });
        }

        // Get user
        const user = await User.findById(verification.userId);

        if (!user || user.accountStatus !== 'active') {
            return res.status(401).json({
                success: false,
                error: 'User not found or inactive'
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
        });

        // Generate new refresh token and revoke old one
        const ipAddress = req.ip || req.socket.remoteAddress;
        const newRefreshTokenData = await createRefreshToken(user._id.toString(), ipAddress);
        await revokeRefreshToken(oldRefreshToken, ipAddress, newRefreshTokenData.token);

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshTokenData.token, cookieOptions);

        res.json({
            success: true,
            data: {
                accessToken,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                }
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
});

// POST /api/auth/revoke-all - Revoke all refresh tokens for current user
router.post('/revoke-all', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();

        const count = await revokeAllUserTokens(req.userId!);

        // Clear refresh token cookie
        res.clearCookie('refreshToken', cookieOptions);

        res.json({
            success: true,
            message: `Revoked ${count} active session(s)`,
            data: { revokedCount: count }
        });
    } catch (error) {
        console.error('Revoke all tokens error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to revoke tokens'
        });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', validate(verifyEmailSchema), async (req: Request, res: Response) => {
    try {
        await connectDB();

        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email and code are required'
            });
        }

        const verification = await EmailVerification.findOne({
            email: email.toLowerCase(),
            code: code,
            used: false,
        }).sort({ createdAt: -1 });

        if (!verification) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification code'
            });
        }

        if (verification.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Verification code has expired'
            });
        }

        const user = await User.findById(verification.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.emailVerified = true;
        await user.save();

        verification.used = true;
        await verification.save();

        // Generate access token
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email,
        });

        // Generate refresh token
        const ipAddress = req.ip || req.socket.remoteAddress;
        const refreshTokenData = await createRefreshToken(user._id.toString(), ipAddress);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refreshTokenData.token, cookieOptions);

        res.json({
            success: true,
            message: 'Email verified successfully',
            data: {
                accessToken,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                }
            }
        });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify email'
        });
    }
});
// POST /api/auth/resend-verification
router.post('/resend-verification', validate(resendVerificationSchema), async (req: Request, res: Response) => {
    try {
        await connectDB();
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ success: false, error: 'Email already verified' });
        }

        // Generate new code
        const verificationCode = generateEmailVerificationCode();
        const verificationHash = hashCode(verificationCode);

        // Invalidate old codes
        await EmailVerification.updateMany(
            { userId: user._id, used: false },
            { used: true }
        );

        await EmailVerification.create({
            userId: user._id,
            email: email.toLowerCase(),
            code: verificationCode,
            codeHash: verificationHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await sendEmailVerification(email, verificationCode);

        res.json({
            success: true,
            message: 'Verification code resent successfully'
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to resend verification' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', requestPasswordResetLimiter, validate(forgotPasswordSchema), async (req: Request, res: Response) => {
    try {
        await connectDB();

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists
            return res.json({
                success: true,
                message: 'If an account exists, a password reset email has been sent.'
            });
        }

        const resetToken = generatePasswordResetToken();
        const tokenHash = hashCode(resetToken);

        await PasswordReset.create({
            userId: user._id,
            email: email.toLowerCase(),
            token: resetToken,
            tokenHash: tokenHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        await sendPasswordResetEmail(email, resetToken);

        res.json({
            success: true,
            message: 'If an account exists, a password reset email has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process request'
        });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req: Request, res: Response) => {
    try {
        await connectDB();

        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Token and new password are required'
            });
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                error: passwordValidation.errors.join('. ')
            });
        }

        const resetRecord = await PasswordReset.findOne({
            token: token,
            used: false,
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired reset token'
            });
        }

        if (resetRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                error: 'Reset token has expired'
            });
        }

        const user = await User.findById(resetRecord.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.passwordHash = hashedPassword;
        user.failedLoginAttempts = 0;
        user.accountStatus = 'active';
        await user.save();

        resetRecord.used = true;
        await resetRecord.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current and new password are required' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Incorrect current password' });
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return res.status(400).json({ success: false, error: passwordValidation.errors.join('. ') });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, error: 'Failed to change password' });
    }
});

export default router;
