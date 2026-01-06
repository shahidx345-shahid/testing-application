/**
 * GET /api/payments/chargebacks
 * GET /api/payments/chargebacks/[id]
 * PATCH /api/payments/chargebacks/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentDisputeModel } from '@/lib/models/payment-dispute-model';
import { ChargebackNoticeResponse, ChargebacksListResponse } from '@/lib/types/payment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const chargebackId = url.searchParams.get('chargebackId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (chargebackId) {
      // Get specific chargeback
      const chargeback = await PaymentDisputeModel.findOne({
        _id: chargebackId,
        userId,
        type: 'chargeback',
      });

      if (!chargeback) {
        return NextResponse.json(
          { success: false, error: 'Chargeback not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: chargeback._id,
          userId: chargeback.userId,
          disputeId: chargeback._id,
          transactionId: chargeback.transactionId,
          amount: 5000, // Would be from transaction in production
          currency: 'USD',
          caseNumber: `CB${Date.now().toString().slice(-9)}`,
          status: chargeback.status,
          reason: chargeback.reason,
          initiatedDate: chargeback.createdAt?.toISOString(),
          dueDate: chargeback.deadline?.toISOString(),
          responseDeadline: new Date(Date.now() + 10 * 24 * 60 * 60000).toISOString(),
          description: chargeback.description,
          requiredDocuments: chargeback.evidence || [],
          createdAt: chargeback.createdAt?.toISOString(),
        },
      } as ChargebackNoticeResponse);
    }

    // List all chargebacks for user
    const chargebacks = await PaymentDisputeModel.find({
      userId,
      type: 'chargeback',
    });

    return NextResponse.json({
      success: true,
      data: chargebacks.map((cb: any) => ({
        id: cb._id,
        userId: cb.userId,
        disputeId: cb._id,
        transactionId: cb.transactionId,
        amount: 5000,
        currency: 'USD',
        caseNumber: `CB${Date.now().toString().slice(-9)}`,
        status: cb.status,
        reason: cb.reason,
        initiatedDate: cb.createdAt?.toISOString(),
        dueDate: cb.deadline?.toISOString(),
        responseDeadline: new Date(Date.now() + 10 * 24 * 60 * 60000).toISOString(),
        description: cb.description,
        requiredDocuments: cb.evidence || [],
        createdAt: cb.createdAt?.toISOString(),
      })),
    } as ChargebacksListResponse);
  } catch (error) {
    console.error('Chargebacks fetch error:', error);
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
    const { userId, requiredDocuments, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'MISSING_CHARGEBACK_ID' },
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
    if (requiredDocuments) updateData.evidence = requiredDocuments;

    // Update chargeback in database
    const result = await PaymentDisputeModel.findOneAndUpdate(
      { _id: id, userId, type: 'chargeback' },
      updateData,
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Chargeback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Chargeback notice updated', databaseId: id },
    });
  } catch (error) {
    console.error('Chargeback update error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
