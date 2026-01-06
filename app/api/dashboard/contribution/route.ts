/**
 * Dashboard Contribution API
 * GET /api/dashboard/contribution - Check today's contribution status
 * POST /api/dashboard/contribution - Process manual contribution
 */

import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '@/lib/services/dashboard-service';
import { DailyContribution } from '@/lib/models/DailyContribution';
import { Save2740Plan } from '@/lib/models/save2740.model';
import { Transaction } from '@/lib/models/transaction';
import { Achievement } from '@/lib/models/Achievement';
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

// GET - Check today's contribution status
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

        const contribution = await DashboardService.getTodayContribution(userId);

        return NextResponse.json({
            success: true,
            data: contribution,
        });
    } catch (error) {
        console.error('Get contribution error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}

// POST - Process manual contribution
export async function POST(request: NextRequest) {
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

        const { amount, paymentMethodId, planId } = await request.json();

        // Validation
        if (!amount || !paymentMethodId) {
            return NextResponse.json(
                { success: false, error: 'MISSING_REQUIRED_FIELDS' },
                { status: 400 }
            );
        }

        if (amount < 100) { // Minimum $1.00
            return NextResponse.json(
                { success: false, error: 'AMOUNT_TOO_LOW' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if contribution already exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingContribution = await DailyContribution.findOne({
            userId,
            date: { $gte: today },
            status: 'completed',
        });

        if (existingContribution) {
            return NextResponse.json(
                { success: false, error: 'CONTRIBUTION_ALREADY_EXISTS' },
                { status: 400 }
            );
        }

        // Create transaction record
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transaction = await Transaction.create({
            userId,
            type: 'savings-contribution',
            amount,
            currency: 'USD',
            status: 'completed',
            paymentMethodId,
            description: `Daily contribution - ${today.toLocaleDateString()}`,
            transactionId,
            savingsPlanId: planId,
            fee: 0,
            netAmount: amount,
            balanceBefore: 0, // Will be updated
            balanceAfter: 0, // Will be updated
            completedAt: new Date(),
        });

        // Create daily contribution record
        const contribution = await DailyContribution.create({
            userId,
            date: today,
            amount,
            status: 'completed',
            planId,
            transactionId: transaction._id.toString(),
            paymentMethodId,
            isAutoDebit: false,
            completedAt: new Date(),
        });

        // Update plan balance if planId provided
        if (planId) {
            const plan = await Save2740Plan.findOne({ _id: planId, userId });
            if (plan) {
                plan.currentBalance += amount;
                plan.totalContributions += amount;
                plan.contributionCount += 1;
                plan.lastContributionDate = new Date();

                // Update streak
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayContrib = await DailyContribution.findOne({
                    userId,
                    date: { $gte: yesterday, $lt: today },
                    status: 'completed',
                });

                if (yesterdayContrib || plan.streakDays === 0) {
                    plan.streakDays += 1;
                    plan.longestStreak = Math.max(plan.longestStreak, plan.streakDays);
                } else {
                    plan.streakDays = 1;
                }

                await plan.save();
            }
        }

        // Check for achievement unlocks
        const newAchievements: any[] = [];
        const stats = await DashboardService.getDashboardStats(userId);
        const totalSavedDollars = stats.currentBalance / 100;

        // Check savings milestones
        const milestones = [500, 1000, 2500, 5000, 7500, 10000, 27400];
        for (const milestone of milestones) {
            if (totalSavedDollars >= milestone) {
                const existing = await Achievement.findOne({
                    userId,
                    achievementType: 'savings_milestone',
                    achievementAmount: milestone * 100,
                });

                if (!existing) {
                    const achievement = await Achievement.create({
                        userId,
                        achievementType: 'savings_milestone',
                        achievementName: `Save $${milestone.toLocaleString()}`,
                        achievementAmount: milestone * 100,
                        description: `You've successfully saved $${milestone.toLocaleString()}!`,
                        metadata: {
                            totalSaved: stats.currentBalance,
                        },
                    });
                    newAchievements.push(achievement);
                }
            }
        }

        // Check for first contribution achievement
        const contributionCount = await DailyContribution.countDocuments({
            userId,
            status: 'completed',
        });

        if (contributionCount === 1) {
            const achievement = await Achievement.create({
                userId,
                achievementType: 'first_contribution',
                achievementName: 'First Contribution',
                description: 'You made your first savings contribution!',
                metadata: {
                    contributionCount: 1,
                },
            });
            newAchievements.push(achievement);
        }

        return NextResponse.json({
            success: true,
            data: {
                contribution,
                transaction,
                newAchievements,
                streakUpdated: true,
            },
        });
    } catch (error) {
        console.error('Process contribution error:', error);
        return NextResponse.json(
            { success: false, error: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
        );
    }
}
