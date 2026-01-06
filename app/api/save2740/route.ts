/**
 * POST /api/save2740/create
 * GET /api/save2740 (list all plans)
 * GET /api/save2740/[id] (get specific plan)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Save2740PlanResponse, PlansListResponse } from '@/lib/types/save2740';
import { connectDB } from '@/lib/db';
import { Save2740Plan } from '@/lib/models/save2740.model';
import jwt from 'jsonwebtoken';

function getUserIdFromToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      savingsMode,
      dailyAmount,
      weeklyAmount,
      targetAmount,
      startDate,
      targetCompletionDate,
      autoFund,
      autoFundPaymentMethodId,
      notifications,
      visibility,
    } = await request.json();

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

    // Validation
    if (!name || !savingsMode || !targetAmount || !startDate || !targetCompletionDate) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly'].includes(savingsMode)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_SAVINGS_MODE' },
        { status: 400 }
      );
    }

    if (savingsMode === 'daily' && !dailyAmount) {
      return NextResponse.json(
        { success: false, error: 'DAILY_AMOUNT_REQUIRED' },
        { status: 400 }
      );
    }

    if (savingsMode === 'weekly' && !weeklyAmount) {
      return NextResponse.json(
        { success: false, error: 'WEEKLY_AMOUNT_REQUIRED' },
        { status: 400 }
      );
    }

    if (targetAmount < 10000) {
      // Minimum PKR 100
      return NextResponse.json(
        { success: false, error: 'TARGET_AMOUNT_TOO_LOW' },
        { status: 400 }
      );
    }

    const startDateObj = new Date(startDate);
    const targetDateObj = new Date(targetCompletionDate);

    if (startDateObj >= targetDateObj) {
      return NextResponse.json(
        { success: false, error: 'INVALID_DATE_RANGE' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create plan in database
    const plan = await Save2740Plan.create({
      userId,
      name,
      description,
      status: 'active',
      savingsMode,
      dailyAmount,
      weeklyAmount,
      totalTargetAmount: targetAmount,
      currentBalance: 0,
      startDate: startDateObj,
      targetCompletionDate: targetDateObj,
      estimatedCompletionDate: targetDateObj,
      totalContributions: 0,
      contributionCount: 0,
      daysActive: 0,
      streakDays: 0,
      longestStreak: 0,
      autoFund: autoFund || false,
      autoFundPaymentMethodId,
      notifications: notifications || {
        dailyReminder: true,
        weeklyReport: true,
        milestoneAlerts: true,
      },
      visibility: visibility || 'private',
    });

    return NextResponse.json({
      success: true,
      data: plan,
    } as Save2740PlanResponse);
  } catch (error) {
    console.error('Save2740 POST error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const planId = url.searchParams.get('id');
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

    if (planId) {
      // Get specific plan
      const plan = await Save2740Plan.findOne({
        _id: planId,
        userId,
      });

      if (!plan) {
        return NextResponse.json(
          { success: false, error: 'PLAN_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: plan,
      } as Save2740PlanResponse);
    }

    // List all plans for user
    const activePlans = await Save2740Plan.find({
      userId,
      status: 'active',
    }).sort({ createdAt: -1 });

    const completedPlans = await Save2740Plan.find({
      userId,
      status: 'completed',
    }).sort({ completionDate: -1 });

    const pausedPlans = await Save2740Plan.find({
      userId,
      status: 'paused',
    }).sort({ updatedAt: -1 });

    // Calculate totals
    const allPlans = await Save2740Plan.find({ userId });
    const totalSaved = allPlans.reduce((sum, plan) => sum + plan.currentBalance, 0);
    const totalTarget = allPlans.reduce((sum, plan) => sum + plan.totalTargetAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        activePlans,
        completedPlans,
        pausedPlans,
        totalSaved,
        totalTarget,
      },
    } as PlansListResponse);
  } catch (error) {
    console.error('Save2740 GET error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
