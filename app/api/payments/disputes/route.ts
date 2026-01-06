/**
 * POST /api/payments/disputes
 * GET /api/payments/disputes
 * GET /api/payments/disputes/[id]
 * PATCH /api/payments/disputes/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentDisputeModel } from '@/lib/models/payment-dispute-model';
import { PaymentDisputeResponse, DisputesListResponse } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, transactionId, reason, description, evidence } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!transactionId || !reason || !description) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    const validReasons = [
      'unauthorized',
      'duplicate',
      'fraudulent',
      'service-issue',
      'billing-error',
      'product-not-received',
      'other',
    ];

    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_DISPUTE_REASON' },
        { status: 400 }
      );
    }

    // Create dispute in database
    const dispute = await PaymentDisputeModel.create({
      userId,
      transactionId,
      reason,
      description,
      status: 'open',
      evidence: evidence || [],
      filedDate: new Date(),
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60000), // 45 days
    });

    return NextResponse.json({
      success: true,
      data: {
        id: dispute._id,
        userId,
        transactionId,
        amount: 5000, // Would be from transaction query in production
        currency: 'USD',
        status: 'open',
        reason,
        description,
        filedDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60000).toISOString(),
        evidence: evidence || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      databaseId: dispute._id,
    });
  } catch (error) {
    console.error('Dispute creation error:', error);
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
    const disputeId = url.searchParams.get('disputeId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (disputeId) {
      // Get specific dispute
      const dispute = await PaymentDisputeModel.findOne({
        _id: disputeId,
        userId,
      });

      if (!dispute) {
        return NextResponse.json(
          { success: false, error: 'Dispute not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: dispute._id,
          userId: dispute.userId,
          transactionId: dispute.transactionId,
          amount: 5000, // Would be from transaction in production
          currency: 'USD',
          status: dispute.status,
          reason: dispute.reason,
          description: dispute.description,
          filedDate: dispute.filedDate?.toISOString(),
          deadline: dispute.deadline?.toISOString(),
          evidence: dispute.evidence,
          createdAt: dispute.createdAt?.toISOString(),
          updatedAt: dispute.updatedAt?.toISOString(),
        },
      } as PaymentDisputeResponse);
    }

    // List all disputes for user
    const disputes = await PaymentDisputeModel.find({ userId });

    return NextResponse.json({
      success: true,
      data: disputes.map((d: any) => ({
        id: d._id,
        userId: d.userId,
        transactionId: d.transactionId,
        amount: 5000,
        currency: 'USD',
        status: d.status,
        reason: d.reason,
        description: d.description,
        filedDate: d.filedDate?.toISOString(),
        deadline: d.deadline?.toISOString(),
        evidence: d.evidence,
        createdAt: d.createdAt?.toISOString(),
        updatedAt: d.updatedAt?.toISOString(),
      })),
    } as DisputesListResponse);
  } catch (error) {
    console.error('Disputes fetch error:', error);
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
    const { userId, evidence, customerStatement, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'MISSING_DISPUTE_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = { ...updates };
    if (evidence) updateData.evidence = evidence;
    if (customerStatement) updateData.customerStatement = customerStatement;

    // Update dispute in database
    const result = await PaymentDisputeModel.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Dispute updated', databaseId: id },
    });
  } catch (error) {
    console.error('Dispute update error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
