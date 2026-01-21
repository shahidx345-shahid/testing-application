/**
 * Token Utility Functions
 * Handles JWT access and refresh tokens
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RefreshToken } from '../models/refresh-token.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload {
    userId: string;
    email: string;
    role?: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshTokenString(): string {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Create refresh token in database
 */
export async function createRefreshToken(
    userId: string,
    ipAddress?: string
): Promise<{ token: string; expiresAt: Date }> {
    const token = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
        userId,
        token,
        expiresAt,
        createdByIp: ipAddress
    });

    return { token, expiresAt };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    message?: string;
}> {
    try {
        const refreshToken = await RefreshToken.findOne({ token });

        if (!refreshToken) {
            return { valid: false, message: 'Refresh token not found' };
        }

        if (refreshToken.revokedAt) {
            return { valid: false, message: 'Refresh token has been revoked' };
        }

        if (refreshToken.expiresAt < new Date()) {
            return { valid: false, message: 'Refresh token has expired' };
        }

        return {
            valid: true,
            userId: refreshToken.userId.toString()
        };
    } catch (error) {
        return { valid: false, message: 'Invalid refresh token' };
    }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(
    token: string,
    ipAddress?: string,
    replacedByToken?: string
): Promise<boolean> {
    try {
        const refreshToken = await RefreshToken.findOne({ token });

        if (!refreshToken) {
            return false;
        }

        refreshToken.revokedAt = new Date();
        refreshToken.revokedByIp = ipAddress;
        refreshToken.replacedByToken = replacedByToken;

        await refreshToken.save();
        return true;
    } catch (error) {
        console.error('Error revoking refresh token:', error);
        return false;
    }
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<number> {
    try {
        const result = await RefreshToken.updateMany(
            {
                userId,
                revokedAt: null,
                expiresAt: { $gt: new Date() }
            },
            {
                revokedAt: new Date(),
                revokedByIp: 'system'
            }
        );

        return result.modifiedCount;
    } catch (error) {
        console.error('Error revoking all user tokens:', error);
        return 0;
    }
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    try {
        const result = await RefreshToken.deleteMany({
            expiresAt: { $lt: new Date() }
        });

        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up expired tokens:', error);
        return 0;
    }
}

/**
 * Get active tokens for user
 */
export async function getUserActiveTokens(userId: string): Promise<number> {
    try {
        return await RefreshToken.countDocuments({
            userId,
            revokedAt: null,
            expiresAt: { $gt: new Date() }
        });
    } catch (error) {
        console.error('Error getting user active tokens:', error);
        return 0;
    }
}

export default {
    generateAccessToken,
    generateRefreshTokenString,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    cleanupExpiredTokens,
    getUserActiveTokens
};
