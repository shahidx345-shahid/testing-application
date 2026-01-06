/**
 * Referrals API
 * GET /api/referrals - Get user's referral data
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        // Get token from cookies or Authorization header
        let token = request.cookies.get('authToken')?.value;

        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.slice(7);
            }
        }

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        // Verify JWT token
        let userId;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
            userId = decoded.userId;
        } catch (error) {
            return NextResponse.json(
                { success: false, error: 'INVALID_TOKEN' },
                { status: 401 }
            );
        }

        // TODO: Fetch real data from database
        // For now, return dynamic data based on userId

        // Generate referral code from userId (or fetch from DB)
        const referralCode = userId.substring(0, 8);
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://save2740.com';
        const referralLink = `${baseUrl}/invite/${referralCode}`;

        // TODO: Query database for actual referral stats
        // const referralStats = await Referral.aggregate([...])

        const referralData = {
            referralCode,
            referralLink,
            friendsInvited: 0, // TODO: Count from referrals table
            qualifiedReferrals: 0, // TODO: Count qualified referrals
            totalEarnings: 0, // TODO: Sum of bonuses earned
            pendingEarnings: 0, // TODO: Sum of pending bonuses
        };

        return NextResponse.json({
            success: true,
            data: referralData,
        });
    } catch (error) {
        console.error('Referrals GET error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}
