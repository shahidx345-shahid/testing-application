/**
 * Dashboard Overview API
 * GET /api/dashboard/overview
 * Returns all dashboard data in a single optimized request
 */

import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/lib/services/dashboard-service';
import { Save2740Plan } from '@/lib/models/save2740.model';
import { Transaction } from '@/lib/models/transaction';
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

        // Fetch all data in parallel
        const [stats, streak, todayContribution, savingsBreakdown, achievements, activePlans, recentTransactions] = await Promise.all([
            DashboardService.getDashboardStats(userId),
            DashboardService.getStreakInfo(userId),
            DashboardService.getTodayContribution(userId),
            DashboardService.getSavingsBreakdown(userId),
            DashboardService.getAchievements(userId),
            Save2740Plan.find({ userId, status: 'active' }).limit(5).sort({ createdAt: -1 }),
            Transaction.find({ userId, status: 'completed' }).limit(10).sort({ createdAt: -1 }),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                streak,
                todayContribution,
                savingsBreakdown,
                achievements: {
                    unlocked: achievements.totalUnlocked,
                    total: achievements.totalAvailable,
                },
                activePlans,
                recentTransactions,
            },
        });
    } catch (error) {
        console.error('Dashboard overview error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}
