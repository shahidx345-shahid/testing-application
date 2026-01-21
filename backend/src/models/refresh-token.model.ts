/**
 * Refresh Token Model
 * Stores refresh tokens for JWT authentication
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdByIp?: string;
    revokedAt?: Date;
    revokedByIp?: string;
    replacedByToken?: string;
    createdAt: Date;
    updatedAt: Date;
    isExpired: boolean;
    isActive: boolean;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        token: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        createdByIp: {
            type: String
        },
        revokedAt: {
            type: Date
        },
        revokedByIp: {
            type: String
        },
        replacedByToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Virtual for checking if token is expired
RefreshTokenSchema.virtual('isExpired').get(function (this: IRefreshToken) {
    return Date.now() >= this.expiresAt.getTime();
});

// Virtual for checking if token is active
RefreshTokenSchema.virtual('isActive').get(function (this: IRefreshToken) {
    return !this.revokedAt && !this.isExpired;
});

// Index for automatic cleanup of expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
