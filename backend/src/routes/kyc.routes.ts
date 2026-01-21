import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { User } from '../models/auth.model';
import { KycDocument } from '../models/kyc-document';
import { connectDB } from '../config/db';

const router = express.Router();

// GET /api/kyc/status - Get KYC status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Try to find KYC document
        const kycDoc = await KycDocument.findOne({ userId: req.userId }).sort({ createdAt: -1 });

        // Check for documents (assuming they are stored in the latest kycDoc)
        const documents: any = {};
        let uploadedCount = 0;
        const totalDocs = 4; // idFront, idBack, selfie, addressProof

        if (kycDoc) {
            if (kycDoc.frontImageUrl) {
                documents.idFront = { uploadedAt: kycDoc.createdAt, status: kycDoc.status, url: kycDoc.frontImageUrl };
                uploadedCount++;
            }
            if (kycDoc.backImageUrl) {
                documents.idBack = { uploadedAt: kycDoc.createdAt, status: kycDoc.status, url: kycDoc.backImageUrl };
                uploadedCount++;
            }
            if (kycDoc.selfieImageUrl) {
                documents.selfie = { uploadedAt: kycDoc.createdAt, status: kycDoc.status, url: kycDoc.selfieImageUrl };
                uploadedCount++;
            }
        }

        const completionPercentage = Math.round((uploadedCount / totalDocs) * 100);

        // Define limits based on status
        const isVerified = user.kycStatus === 'approved';
        const limits = isVerified ? {
            dailyTransactionLimit: 50000,
            monthlyTransactionLimit: 500000,
            dailyWithdrawalLimit: 10000
        } : {
            dailyTransactionLimit: 1000,
            monthlyTransactionLimit: 5000,
            dailyWithdrawalLimit: 0
        };

        res.json({
            success: true,
            data: {
                status: user.kycStatus || 'not_started',
                completionPercentage,
                documents,
                limits,
                level: user.kycLevel || 0,
                submittedAt: kycDoc?.createdAt,
                reviewedAt: kycDoc?.verifiedAt,
                rejectionReason: kycDoc?.rejectionReason
            }
        });
    } catch (error) {
        console.error('KYC status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get KYC status'
        });
    }
});

export default router;
