/**
 * MongoDB Index Management
 * Creates indexes for optimal query performance
 * IDEMPOTENT - Safe to run multiple times
 */

import mongoose from 'mongoose';
import { User } from '../models/auth.model';
import { Wallet } from '../models/wallet.model';
import { Transaction } from '../models/transaction.model';
import { RefreshToken } from '../models/refresh-token.model';
import { Group } from '../models/group.model';
import { PaymentMethod } from '../models/payment-method.model';

/**
 * Helper to ensure index exists (idempotent)
 */
async function ensureIndex(
    collection: mongoose.Collection,
    indexSpec: any,
    options: any = {}
): Promise<void> {
    try {
        // createIndex is idempotent - MongoDB won't recreate if it exists
        await collection.createIndex(indexSpec, { ...options, background: true });
    } catch (error: any) {
        // Ignore if index already exists with different options
        if (error.code === 85 || error.code === 86 || error.codeName === 'IndexOptionsConflict' || error.codeName === 'IndexKeySpecsConflict') {
            // Index exists with different options - this is fine
            return;
        }
        throw error;
    }
}

/**
 * Create all necessary indexes (IDEMPOTENT)
 */
export async function createIndexes(): Promise<void> {
    console.log('📊 Ensuring MongoDB indexes...');

    try {
        // User indexes
        await ensureIndex(User.collection, { email: 1 }, { unique: true });
        await ensureIndex(User.collection, { referralCode: 1 }, { unique: true, sparse: true });
        await ensureIndex(User.collection, { accountStatus: 1 });
        await ensureIndex(User.collection, { kycStatus: 1 });
        await ensureIndex(User.collection, { createdAt: -1 });
        await ensureIndex(User.collection, { emailVerified: 1 });
        await ensureIndex(User.collection, { lastLogin: -1 });
        console.log('✅ User indexes ready');

        // Wallet indexes
        await ensureIndex(Wallet.collection, { userId: 1 }, { unique: true });
        await ensureIndex(Wallet.collection, { balance: -1 });
        await ensureIndex(Wallet.collection, { currentStreak: -1 });
        await ensureIndex(Wallet.collection, { updatedAt: -1 });
        console.log('✅ Wallet indexes ready');

        // Transaction indexes
        await ensureIndex(Transaction.collection, { userId: 1, createdAt: -1 });
        await ensureIndex(Transaction.collection, { type: 1 });
        await ensureIndex(Transaction.collection, { status: 1 });
        await ensureIndex(Transaction.collection, { externalTransactionId: 1 }, { sparse: true });
        await ensureIndex(Transaction.collection, { createdAt: -1 });
        await ensureIndex(Transaction.collection, { userId: 1, type: 1, status: 1 });
        console.log('✅ Transaction indexes ready');

        // Refresh Token indexes
        await ensureIndex(RefreshToken.collection, { token: 1 }, { unique: true });
        await ensureIndex(RefreshToken.collection, { userId: 1 });
        await ensureIndex(RefreshToken.collection, { expiresAt: 1 }, { expireAfterSeconds: 0 });
        await ensureIndex(RefreshToken.collection, { userId: 1, revokedAt: 1, expiresAt: 1 });
        console.log('✅ RefreshToken indexes ready');

        // Group indexes
        await ensureIndex(Group.collection, { joinCode: 1 }, { unique: true });
        await ensureIndex(Group.collection, { creatorId: 1 });
        await ensureIndex(Group.collection, { status: 1 });
        await ensureIndex(Group.collection, { 'members.userId': 1 });
        await ensureIndex(Group.collection, { createdAt: -1 });
        console.log('✅ Group indexes ready');

        // Payment Method indexes
        await ensureIndex(PaymentMethod.collection, { userId: 1, status: 1 });
        await ensureIndex(PaymentMethod.collection, { providerId: 1 }, { sparse: true });
        await ensureIndex(PaymentMethod.collection, { isDefault: 1 });
        await ensureIndex(PaymentMethod.collection, { createdAt: -1 });
        console.log('✅ PaymentMethod indexes ready');

        // Optional models - create indexes if they exist
        try {
            const Notification = mongoose.models.Notification;
            if (Notification) {
                await ensureIndex(Notification.collection, { userId: 1, read: 1 });
                await ensureIndex(Notification.collection, { createdAt: -1 });
                console.log('✅ Notification indexes ready');
            }
        } catch (error) {
            // Notification model might not exist yet
        }

        try {
            const Pocket = mongoose.models.Pocket;
            if (Pocket) {
                await ensureIndex(Pocket.collection, { userId: 1, status: 1 });
                await ensureIndex(Pocket.collection, { createdAt: -1 });
                console.log('✅ Pocket indexes ready');
            }
        } catch (error) {
            // Pocket model might not exist yet
        }

        try {
            const { KycDocument } = require('../models/kyc-document');
            if (KycDocument) {
                await ensureIndex(KycDocument.collection, { userId: 1 });
                await ensureIndex(KycDocument.collection, { status: 1 });
                await ensureIndex(KycDocument.collection, { submittedAt: -1 });
                console.log('✅ KycDocument indexes ready');
            }
        } catch (error) {
            // KycDocument model might not exist yet
        }

        try {
            const { EmailVerification, PasswordReset } = require('../models/auth.model');
            
            if (EmailVerification) {
                await ensureIndex(EmailVerification.collection, { email: 1 });
                await ensureIndex(EmailVerification.collection, { code: 1 });
                await ensureIndex(EmailVerification.collection, { expiresAt: 1 }, { expireAfterSeconds: 0 });
                await ensureIndex(EmailVerification.collection, { used: 1 });
                console.log('✅ EmailVerification indexes ready');
            }

            if (PasswordReset) {
                await ensureIndex(PasswordReset.collection, { email: 1 });
                await ensureIndex(PasswordReset.collection, { token: 1 });
                await ensureIndex(PasswordReset.collection, { expiresAt: 1 }, { expireAfterSeconds: 0 });
                await ensureIndex(PasswordReset.collection, { used: 1 });
                console.log('✅ PasswordReset indexes ready');
            }
        } catch (error) {
            // Auth verification models might not exist yet
        }

        console.log('✅ All indexes ready');
    } catch (error) {
        console.error('❌ Error ensuring indexes:', error);
        // Don't throw - let server start even if indexes fail
        console.warn('⚠️  Server will continue without some indexes');
    }
}

/**
 * Drop all indexes (useful for reindexing)
 */
export async function dropAllIndexes(): Promise<void> {
    console.log('🗑️  Dropping all indexes...');

    try {
        await User.collection.dropIndexes();
        await Wallet.collection.dropIndexes();
        await Transaction.collection.dropIndexes();
        await RefreshToken.collection.dropIndexes();
        await Group.collection.dropIndexes();
        await PaymentMethod.collection.dropIndexes();

        console.log('✅ All indexes dropped');
    } catch (error) {
        console.error('❌ Error dropping indexes:', error);
        throw error;
    }
}

/**
 * List all indexes for a collection
 */
export async function listIndexes(collectionName: string): Promise<any[]> {
    try {
        const collection = mongoose.connection.collection(collectionName);
        const indexes = await collection.indexes();
        
        console.log(`📋 Indexes for ${collectionName}:`);
        indexes.forEach((index, i) => {
            console.log(`  ${i + 1}. ${index.name}:`, JSON.stringify(index.key));
        });

        return indexes;
    } catch (error) {
        console.error(`❌ Error listing indexes for ${collectionName}:`, error);
        return [];
    }
}

/**
 * Get index stats
 */
export async function getIndexStats(): Promise<void> {
    try {
        const db = mongoose.connection.db;
        if (!db) {
            console.warn('Database connection not established');
            return;
        }
        
        const collections = await db.listCollections().toArray();
        
        console.log('📊 Index Statistics:');
        
        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = mongoose.connection.collection(collectionName);
            
            const indexes = await collection.indexes();
            const stats: any = await (collection as any).stats();
            
            console.log(`\n${collectionName}:`);
            console.log(`  Documents: ${stats.count}`);
            console.log(`  Indexes: ${indexes.length}`);
            console.log(`  Total Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
        }
    } catch (error) {
        console.error('❌ Error getting index stats:', error);
    }
}

export default {
    createIndexes,
    dropAllIndexes,
    listIndexes,
    getIndexStats
};
