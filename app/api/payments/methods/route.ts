/**
 * GET /api/payments/methods
 * POST /api/payments/methods/set-default
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentMethodModel } from '@/lib/models/payment-method-model';
import { PaymentMethodsListResponse } from '@/lib/types/payment';

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

    // Query all payment methods for this user from database
    const bankAccounts = await PaymentMethodModel.find({
      userId,
      type: 'bank-account',
    });

    const debitCards = await PaymentMethodModel.find({
      userId,
      type: 'debit-card',
    });

    const defaultBankAccount = bankAccounts.find((m: any) => m.isDefault);
    const defaultCard = debitCards.find((m: any) => m.isDefault);
    const defaultMethod = defaultBankAccount || defaultCard;

    return NextResponse.json({
      success: true,
      data: {
        bankAccounts: bankAccounts.map((m: any) => ({
          id: m._id,
          userId: m.userId,
          accountHolderName: m.accountHolderName,
          routingNumber: m.routingNumber,
          accountNumber: m.accountNumber,
          bankName: m.bankName,
          accountType: m.accountType,
          status: m.status,
          isDefault: m.isDefault,
          verificationMethod: m.verificationMethod,
          verificationStatus: m.verificationStatus,
          plaidAccountId: m.plaidAccountId,
          linkedAt: m.createdAt?.toISOString(),
          displayName: m.displayName,
        })),
        debitCards: debitCards.map((m: any) => ({
          id: m._id,
          userId: m.userId,
          cardholderName: m.cardholderName,
          last4: m.last4,
          brand: m.brand,
          status: m.status,
          isDefault: m.isDefault,
          billingAddress: m.billingAddress,
          stripeTokenId: m.stripeTokenId,
          linkedAt: m.createdAt?.toISOString(),
          expiresAt: new Date(m.expiryYear, m.expiryMonth).toISOString(),
          displayName: m.displayName,
        })),
        defaultMethod: defaultMethod ? {
          id: defaultMethod._id,
          userId: defaultMethod.userId,
          type: defaultMethod.type,
          displayName: defaultMethod.displayName,
          last4: defaultMethod.last4 || defaultMethod.accountNumber,
          issuer: defaultMethod.bankName || defaultMethod.brand,
          status: defaultMethod.status,
          isDefault: true,
          createdAt: defaultMethod.createdAt?.toISOString(),
        } : null,
      },
    } as PaymentMethodsListResponse);
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, methodId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!methodId) {
      return NextResponse.json(
        { success: false, error: 'Method ID is required' },
        { status: 400 }
      );
    }

    // Update all payment methods for this user to not be default
    await PaymentMethodModel.updateMany(
      { userId },
      { isDefault: false }
    );

    // Set the specified method as default
    const result = await PaymentMethodModel.findOneAndUpdate(
      { _id: methodId, userId },
      { isDefault: true },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Payment method not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Default payment method updated', databaseId: methodId },
    });
  } catch (error) {
    console.error('Set default payment method error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
