/**
 * POST /api/payments/receipts
 * GET /api/payments/receipts
 * GET /api/payments/receipts/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/lib/models/transaction';
import { PaymentReceiptResponse } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, transactionId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Query transaction from database
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Generate receipt from transaction
    const receipt = {
      id: `receipt_${transaction._id}`,
      userId,
      transactionId: transaction._id,
      amount: transaction.amount,
      currency: transaction.currency || 'USD',
      paymentMethodId: transaction.paymentMethodId,
      description: transaction.description,
      status: transaction.status,
      receiptNumber: `RCP${Date.now().toString().slice(-8)}`,
      processingFee: transaction.fee || 0,
      netAmount: transaction.netAmount || (transaction.amount - (transaction.fee || 0)),
      timestamp: transaction.createdAt?.toISOString(),
      completedAt: transaction.updatedAt?.toISOString(),
      downloadUrl: `/api/payments/receipts/${transaction._id}/download`,
    };

    return NextResponse.json({
      success: true,
      data: receipt,
      databaseId: transaction._id,
    });
  } catch (error) {
    console.error('Receipt creation error:', error);
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
    const receiptId = url.searchParams.get('receiptId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (receiptId) {
      // Get specific receipt - extract transaction ID from receipt ID
      const transactionId = receiptId.replace('receipt_', '');
      const transaction = await Transaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!transaction) {
        return NextResponse.json(
          { success: false, error: 'Receipt not found' },
          { status: 404 }
        );
      }

      const receipt = {
        id: receiptId,
        userId,
        transactionId: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency || 'USD',
        paymentMethodId: transaction.paymentMethodId,
        description: transaction.description,
        status: transaction.status,
        receiptNumber: `RCP${Date.now().toString().slice(-8)}`,
        processingFee: transaction.fee || 0,
        netAmount: transaction.netAmount || (transaction.amount - (transaction.fee || 0)),
        timestamp: transaction.createdAt?.toISOString(),
        completedAt: transaction.updatedAt?.toISOString(),
        downloadUrl: `/api/payments/receipts/${transactionId}/download`,
      };

      return NextResponse.json({
        success: true,
        data: receipt,
      } as PaymentReceiptResponse);
    }

    // List all receipts for this user - query successful transactions
    const transactions = await Transaction.find({
      userId,
      status: 'completed',
    }).limit(50);

    const receipts = transactions.map((txn: any) => ({
      id: `receipt_${txn._id}`,
      userId,
      transactionId: txn._id,
      amount: txn.amount,
      currency: txn.currency || 'USD',
      paymentMethodId: txn.paymentMethodId,
      description: txn.description,
      status: txn.status,
      receiptNumber: `RCP${Date.now().toString().slice(-8)}`,
      processingFee: txn.fee || 0,
      netAmount: txn.netAmount || (txn.amount - (txn.fee || 0)),
      timestamp: txn.createdAt?.toISOString(),
      completedAt: txn.updatedAt?.toISOString(),
      downloadUrl: `/api/payments/receipts/${txn._id}/download`,
    }));

    return NextResponse.json({
      success: true,
      data: receipts,
    });
  } catch (error) {
    console.error('Receipts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
