/**
 * POST /api/save2740/[id]/complete
 * POST /api/save2740/[id]/restart
 */

import { NextRequest, NextResponse } from 'next/server';
import { PlanCompletionResponse, RestartPlanResponse } from '@/lib/types/save2740';

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 2];
    const action = pathSegments[pathSegments.length - 1];

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const body = await request.json();

    if (!id || !['complete', 'restart'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    if (action === 'complete') {
      const completionData = {
        planId: id,
        planName: 'Emergency Fund',
        totalSaved: 100000, // in cents
        targetAmount: 100000,
        daysToComplete: 91,
        totalContributions: 100000,
        longestStreak: 89,
        completionDate: new Date().toISOString(),
        nextPlanSuggestions: [
          {
            name: 'Vacation Fund',
            suggestedAmount: 150000,
            reason: 'Based on your savings rate, you could save for a vacation next',
          },
          {
            name: 'Investment Fund',
            suggestedAmount: 500000,
            reason: 'Start investing for long-term growth',
          },
        ],
        achievements: [
          {
            badge: '🎯',
            title: 'Goal Achiever',
            description: 'Completed your first Save2740 plan',
          },
          {
            badge: '🔥',
            title: 'Streak Master',
            description: 'Maintained a 89-day savings streak',
          },
          {
            badge: '💪',
            title: 'Discipline',
            description: 'Never missed a single day of saving',
          },
        ],
      };

      return NextResponse.json({
        success: true,
        data: completionData,
      } as PlanCompletionResponse);
    }

    // Restart plan
    if (!body.startDate || !body.targetCompletionDate) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    const newPlan = {
      id: `plan_${Date.now()}`,
      userId: 'user123',
      name: body.name || 'Emergency Fund 2.0',
      status: 'active' as const,
      savingsMode: body.savingsMode || 'daily',
      dailyAmount: body.dailyAmount,
      weeklyAmount: body.weeklyAmount,
      totalTargetAmount: body.newTargetAmount || 100000,
      currentBalance: 0,
      startDate: body.startDate,
      targetCompletionDate: body.targetCompletionDate,
      estimatedCompletionDate: body.targetCompletionDate,
      totalContributions: 0,
      contributionCount: 0,
      daysActive: 0,
      streakDays: 0,
      longestStreak: 0,
      autoFund: true,
      autoFundPaymentMethodId: 'card_123',
      notifications: {
        dailyReminder: true,
        weeklyReport: true,
        milestoneAlerts: true,
      },
      visibility: 'private' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newPlan,
    } as RestartPlanResponse);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
