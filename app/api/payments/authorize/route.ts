/**
 * POST /api/payments/authorize
 * GET /api/payments/authorize/[id]
 * PATCH /api/payments/authorize/[id]/confirm
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/lib/models/transaction';
import { PaymentAuthorizationResponse } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, amount, currency, paymentMethodId, description, merchantName } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!amount || !currency || !paymentMethodId || !description || !merchantName) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    if (amount < 1 || amount > 10000000) {
      return NextResponse.json(
        { success: false, error: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    if (currency.length !== 3 || !/^[A-Z]+$/.test(currency)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CURRENCY' },
        { status: 400 }
      );
    }

    // Simulate fraud detection
    const randomRisk = Math.random();
    const riskLevel = randomRisk > 0.8 ? 'high' : randomRisk > 0.3 ? 'medium' : 'low';
    const requiresConfirmation = riskLevel === 'high';

    // Store authorization in transaction record with type='authorization'
    const authorization = await Transaction.create({
      userId,
      type: 'authorization',
      amount: Math.round(amount),
      currency,
      status: requiresConfirmation ? 'pending' : 'authorized',
      paymentMethodId,
      description,
      metadata: {
        merchantName,
        riskLevel,
        fraudChecksPassed: riskLevel !== 'high',
        cvvMatched: true,
        zipCodeMatched: true,
        avsResponse: 'M',
        requiresConfirmation,
        confirmationDeadline: new Date(Date.now() + 15 * 60000).toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
        ...(riskLevel !== 'high' && {
          authorizationCode: `AUTH${Date.now().toString().slice(-6)}`,
          authorizedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: authorization._id,
        userId,
        amount,
        currency,
        paymentMethodId,
        description,
        merchantName,
        status: requiresConfirmation ? 'pending' : 'authorized',
        riskLevel,
        fraudChecksPassed: riskLevel !== 'high',
        cvvMatched: true,
        zipCodeMatched: true,
        avsResponse: 'M',
        requiresConfirmation,
        confirmationDeadline: new Date(Date.now() + 15 * 60000).toISOString(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60000).toISOString(),
        ...(riskLevel !== 'high' && {
          authorizationCode: `AUTH${Date.now().toString().slice(-6)}`,
          authorizedAt: new Date().toISOString(),
        }),
      },
      databaseId: authorization._id,
    } as PaymentAuthorizationResponse);
  } catch (error) {
    console.error('Authorization creation error:', error);
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
    const id = url.searchParams.get('id');
    const userId = url.searchParams.get('userId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'MISSING_AUTHORIZATION_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query authorization from database
    const authorization = await Transaction.findOne({
      _id: id,
      userId,
      type: 'authorization',
    });

    if (!authorization) {
      return NextResponse.json(
        { success: false, error: 'Authorization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: authorization._id,
        userId: authorization.userId,
        amount: authorization.amount,
        currency: authorization.currency,
        paymentMethodId: authorization.paymentMethodId,
        description: authorization.description,
        ...authorization.metadata,
        createdAt: authorization.createdAt?.toISOString(),
      },
      databaseId: authorization._id,
    } as PaymentAuthorizationResponse);
  } catch (error) {
    console.error('Authorization fetch error:', error);
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
    const { userId, confirmed } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'MISSING_AUTHORIZATION_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update authorization status in database
    const newStatus = confirmed ? 'authorized' : 'cancelled';
    const result = await Transaction.findOneAndUpdate(
      { _id: id, userId, type: 'authorization' },
      { 
        status: newStatus,
        'metadata.authorizedAt': new Date().toISOString(),
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Authorization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { 
        message: confirmed ? 'Authorization confirmed' : 'Authorization cancelled',
        databaseId: id,
      },
    });
  } catch (error) {
    console.error('Authorization confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
