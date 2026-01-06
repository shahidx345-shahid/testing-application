/**
 * POST /api/payments/bank-accounts
 * GET /api/payments/bank-accounts
 * DELETE /api/payments/bank-accounts/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentMethodModel } from '@/lib/models/payment-method-model';
import { BankAccountResponse } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, accountHolderName, routingNumber, accountNumber, accountType, displayName, plaidAccountId } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!accountHolderName || !routingNumber || !accountNumber || !accountType || !displayName) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    if (routingNumber.length !== 9 || !/^\d+$/.test(routingNumber)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_ROUTING_NUMBER' },
        { status: 400 }
      );
    }

    if (accountNumber.length < 8 || accountNumber.length > 17 || !/^\d+$/.test(accountNumber)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_ACCOUNT_NUMBER' },
        { status: 400 }
      );
    }

    // Create payment method (bank account) in database
    // IMPORTANT: Only store last 4 digits and Plaid token, NEVER full account/routing numbers
    const bankAccount = await PaymentMethodModel.create({
      userId,
      type: 'bank-account',
      accountHolderName,
      bankName: 'Bank',
      routingNumber: routingNumber.slice(-4), // Only last 4 digits
      accountNumber: accountNumber.slice(-4), // Only last 4 digits
      accountType,
      displayName,
      plaidAccountId, // Plaid token for verification
      status: 'pending',
      isDefault: false,
      verificationMethod: 'micro-deposits',
      verificationStatus: 'unverified',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: bankAccount._id,
        userId,
        accountHolderName,
        routingNumber: bankAccount.routingNumber,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        accountType,
        status: 'pending',
        isDefault: false,
        verificationMethod: 'micro-deposits',
        verificationStatus: 'unverified',
        plaidAccountId,
        linkedAt: new Date().toISOString(),
        displayName,
      },
      databaseId: bankAccount._id,
    } as BankAccountResponse);
  } catch (error) {
    console.error('Bank account creation error:', error);
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

    // Query all bank accounts for this user from database
    const bankAccounts = await PaymentMethodModel.find({
      userId,
      type: 'bank-account',
    });

    return NextResponse.json({
      success: true,
      data: bankAccounts.map((account: any) => ({
        id: account._id,
        userId: account.userId,
        accountHolderName: account.accountHolderName,
        routingNumber: account.routingNumber,
        accountNumber: account.accountNumber,
        bankName: account.bankName,
        accountType: account.accountType,
        status: account.status,
        isDefault: account.isDefault,
        verificationMethod: account.verificationMethod,
        verificationStatus: account.verificationStatus,
        plaidAccountId: account.plaidAccountId,
        linkedAt: account.createdAt?.toISOString(),
        displayName: account.displayName,
      })),
    });
  } catch (error) {
    console.error('Bank accounts fetch error:', error);
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
        { success: false, error: 'MISSING_BANK_ACCOUNT_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete bank account from database
    const result = await PaymentMethodModel.findOneAndDelete({
      _id: id,
      userId,
      type: 'bank-account',
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Bank account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Bank account removed' },
      databaseId: id,
    });
  } catch (error) {
    console.error('Bank account deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
