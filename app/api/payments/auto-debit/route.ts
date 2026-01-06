/**
 * POST /api/payments/auto-debit
 * GET /api/payments/auto-debit
 * PATCH /api/payments/auto-debit/[id]
 * DELETE /api/payments/auto-debit/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AutoDebitModel } from '@/lib/models/auto-debit-model';
import { AutoDebitResponse, AutoDebitsListResponse } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const {
      userId,
      paymentMethodId,
      amount,
      frequency,
      startDate,
      endDate,
      dayOfMonth,
      dayOfWeek,
      purpose,
      maxRetries,
      notificationPreference,
    } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!paymentMethodId || !amount || !frequency || !startDate || !purpose) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    if (amount < 100 || amount > 100000) {
      return NextResponse.json(
        { success: false, error: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'biweekly', 'monthly', 'custom'].includes(frequency)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_FREQUENCY' },
        { status: 400 }
      );
    }

    if (frequency === 'monthly' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_DAY_OF_MONTH' },
        { status: 400 }
      );
    }

    // Create auto-debit in database
    const autoDebit = await AutoDebitModel.create({
      userId,
      paymentMethodId,
      amount,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      dayOfMonth,
      dayOfWeek,
      status: 'active',
      purpose,
      maxRetries: maxRetries || 3,
      failureCount: 0,
      nextDebitDate: new Date(startDate),
      notificationPreference: notificationPreference || 'email',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: autoDebit._id,
        userId,
        paymentMethodId,
        amount,
        frequency,
        startDate,
        endDate,
        dayOfMonth,
        dayOfWeek,
        status: 'active',
        purpose,
        maxRetries: maxRetries || 3,
        failureCount: 0,
        nextDebitDate: startDate,
        createdAt: new Date().toISOString(),
        notificationPreference: notificationPreference || 'email',
      },
      databaseId: autoDebit._id,
    } as AutoDebitResponse);
  } catch (error) {
    console.error('Auto-debit creation error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query all auto-debits for this user from database
    const autoDebits = await AutoDebitModel.find({ userId });

    return NextResponse.json({
      success: true,
      data: autoDebits.map((ad: any) => ({
        id: ad._id,
        userId: ad.userId,
        paymentMethodId: ad.paymentMethodId,
        amount: ad.amount,
        frequency: ad.frequency,
        startDate: ad.startDate?.toISOString(),
        endDate: ad.endDate?.toISOString(),
        dayOfMonth: ad.dayOfMonth,
        dayOfWeek: ad.dayOfWeek,
        status: ad.status,
        purpose: ad.purpose,
        maxRetries: ad.maxRetries,
        failureCount: ad.failureCount,
        nextDebitDate: ad.nextDebitDate?.toISOString(),
        lastDebitDate: ad.lastDebitDate?.toISOString(),
        createdAt: ad.createdAt?.toISOString(),
        notificationPreference: ad.notificationPreference,
      })),
    } as AutoDebitsListResponse);
  } catch (error) {
    console.error('Auto-debits fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const { userId, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'MISSING_AUTO_DEBIT_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update auto-debit in database
    const result = await AutoDebitModel.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Auto-debit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Auto-debit updated', databaseId: id },
    });
  } catch (error) {
    console.error('Auto-debit update error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const userId = url.searchParams.get('userId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'MISSING_AUTO_DEBIT_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete auto-debit from database
    const result = await AutoDebitModel.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Auto-debit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Auto-debit cancelled', databaseId: id },
    });
  } catch (error) {
    console.error('Auto-debit deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
