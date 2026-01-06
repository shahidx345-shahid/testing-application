/**
 * Dashboard Stats API
 * GET /api/dashboard/stats
 * Returns comprehensive dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/lib/services/dashboard-service';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(token: string): string | null {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'INVALID_TOKEN' },
                { status: 401 }
            );
        }

        await connectDB();

        const stats = await DashboardService.getDashboardStats(userId);

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}
