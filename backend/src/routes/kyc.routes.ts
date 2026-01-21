import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { submitKycSchema } from '../schemas/kyc.schema';
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

        res.json({
            success: true,
            data: {
                status: user.kycStatus || 'not_submitted',
                level: user.kycLevel || 0,
                submittedAt: kycDoc?.createdAt,
                reviewedAt: kycDoc?.reviewedAt,
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

// POST /api/kyc/submit - Submit KYC documents
router.post('/submit', authenticateToken, validate(submitKycSchema), async (req: AuthRequest, res: Response) => {
    try {
        await connectDB();

        const {
            documentType,
            documentNumber,
            documentFront,
            documentBack,
            selfie,
            firstName,
            lastName,
            dateOfBirth,
            address,
            ssn
        } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if already verified
        if (user.kycStatus === 'verified') {
            return res.status(400).json({
                success: false,
                error: 'KYC already verified'
            });
        }

        // Create KYC document
        await KycDocument.create({
            userId: req.userId,
            documentType,
            documentNumber,
            documentFront,
            documentBack,
            selfie,
            firstName,
            lastName,
            dateOfBirth: new Date(dateOfBirth),
            address,
            ssn,
            status: 'pending',
            submittedAt: new Date()
        });

        // Update user status
        user.kycStatus = 'pending';
        user.kycLevel = 1;
        await user.save();

        res.json({
            success: true,
            message: 'KYC documents submitted successfully. Review typically takes 1-3 business days.',
            data: {
                status: 'pending',
                level: 1
            }
        });
    } catch (error) {
        console.error('KYC submit error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit KYC documents'
        });
    }
});

export default router;
