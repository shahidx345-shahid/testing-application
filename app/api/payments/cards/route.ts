/**
 * POST /api/payments/cards
 * GET /api/payments/cards
 * DELETE /api/payments/cards/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentMethodModel } from '@/lib/models/payment-method-model';
import { DebitCardResponse } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId, cardholderName, cardNumber, expiryMonth, expiryYear, cvv, billingAddress, displayName, stripeTokenId } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvv || !displayName) {
      return NextResponse.json(
        { success: false, error: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }

    // Card number validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CARD_NUMBER' },
        { status: 400 }
      );
    }

    // Expiry validation
    const now = new Date();
    if (expiryYear < now.getFullYear() || (expiryYear === now.getFullYear() && expiryMonth < now.getMonth() + 1)) {
      return NextResponse.json(
        { success: false, error: 'CARD_EXPIRED' },
        { status: 400 }
      );
    }

    // CVV validation
    if (cvv.length < 3 || cvv.length > 4 || !/^\d+$/.test(cvv)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CVV' },
        { status: 400 }
      );
    }

    // Determine card brand
    let brand: 'visa' | 'mastercard' | 'amex' | 'discover' = 'visa';
    if (cleanCardNumber.startsWith('5')) brand = 'mastercard';
    else if (cleanCardNumber.startsWith('34') || cleanCardNumber.startsWith('37')) brand = 'amex';
    else if (cleanCardNumber.startsWith('6')) brand = 'discover';

    // Create payment method (card) in database
    // IMPORTANT: Only store last 4 digits and Stripe token, NEVER full card numbers or CVV
    const debitCard = await PaymentMethodModel.create({
      userId,
      type: 'debit-card',
      cardholderName,
      cardNumber: cleanCardNumber.slice(-4), // Only last 4 digits
      expiryMonth,
      expiryYear,
      last4: cleanCardNumber.slice(-4),
      brand,
      status: 'active',
      isDefault: false,
      billingAddress,
      stripeTokenId, // Stripe tokenized card ID
      displayName,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: debitCard._id,
        userId,
        cardholderName,
        last4: debitCard.last4,
        brand,
        status: 'active',
        isDefault: false,
        billingAddress,
        stripeTokenId,
        linkedAt: new Date().toISOString(),
        expiresAt: new Date(expiryYear, expiryMonth).toISOString(),
        displayName,
      },
      databaseId: debitCard._id,
    });
  } catch (error) {
    console.error('Card creation error:', error);
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

    // Query all cards for this user from database
    const debitCards = await PaymentMethodModel.find({
      userId,
      type: 'debit-card',
    });

    return NextResponse.json({
      success: true,
      data: debitCards.map((card: any) => ({
        id: card._id,
        userId: card.userId,
        cardholderName: card.cardholderName,
        last4: card.last4,
        brand: card.brand,
        status: card.status,
        isDefault: card.isDefault,
        billingAddress: card.billingAddress,
        stripeTokenId: card.stripeTokenId,
        linkedAt: card.createdAt?.toISOString(),
        expiresAt: new Date(card.expiryYear, card.expiryMonth).toISOString(),
        lastUsedAt: card.lastUsedAt?.toISOString(),
        displayName: card.displayName,
      })),
    });
  } catch (error) {
    console.error('Cards fetch error:', error);
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
        { success: false, error: 'MISSING_CARD_ID' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete card from database
    const result = await PaymentMethodModel.findOneAndDelete({
      _id: id,
      userId,
      type: 'debit-card',
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Card removed' },
      databaseId: id,
    });
  } catch (error) {
    console.error('Card deletion error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR' },
      { status: 500 }
    );
  }
}
