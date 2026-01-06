/**
 * PATCH /api/save2740/[id]/pause
 * PATCH /api/save2740/[id]/resume
 * PATCH /api/save2740/[id]/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { Save2740PlanResponse, PlanActionResponse } from '@/lib/types/save2740';

export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 2];
    const action = pathSegments[pathSegments.length - 1];

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { reason, feedback } = await request.json();

    if (!id || !['pause', 'resume', 'cancel'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Mock plan
    const plan = {
      id,
      userId: 'user123',
      name: 'Emergency Fund',
      status:
        action === 'pause'
          ? ('paused' as const)
          : action === 'resume'
            ? ('active' as const)
            : ('cancelled' as const),
      savingsMode: 'daily' as const,
      dailyAmount: 2500,
      totalTargetAmount: 100000,
      currentBalance: 42500,
      startDate: '2025-01-01T00:00:00Z',
      targetCompletionDate: '2025-04-01T00:00:00Z',
      estimatedCompletionDate: '2025-03-20T00:00:00Z',
      totalContributions: 42500,
      contributionCount: 17,
      daysActive: 17,
      streakDays: action === 'pause' ? 0 : 15,
      longestStreak: 15,
      ...(action === 'pause' && {
        pausedAt: new Date().toISOString(),
        pausedBalance: 42500,
        pauseReason: reason,
      }),
      autoFund: true,
      autoFundPaymentMethodId: 'card_123',
      notifications: {
        dailyReminder: true,
        weeklyReport: true,
        milestoneAlerts: true,
      },
      visibility: 'private' as const,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: plan,
    } as PlanActionResponse);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
