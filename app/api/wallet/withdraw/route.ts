/**
 * Wallet API Route - Withdraw Money
 * /api/wallet/withdraw
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Transaction } from '@/lib/models/transaction'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, amount, paymentMethodId, description, twoFactorCode } = body

    // Validation
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid withdrawal amount' },
        { status: 400 }
      )
    }

    if (amount < 10) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal is $10' },
        { status: 400 }
      )
    }

    if (amount > 10000) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal exceeds daily limit' },
        { status: 400 }
      )
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      )
    }

    // In production: Verify available balance from user wallet
    // For now, assume sufficient balance
    const availableBalance = 1250.50

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create withdrawal transaction record in MongoDB
    const transaction = await Transaction.create({
      userId,
      type: 'withdrawal',
      amount: Math.round(amount * 100), // Store in cents
      currency: 'USD',
      status: 'pending', // ACH transfers are pending
      paymentMethodId,
      transactionId,
      fee: 0, // ACH withdrawals typically have no fee
      netAmount: Math.round(amount * 100),
      description: description || 'Wallet withdrawal',
      balanceBefore: Math.round(availableBalance * 100),
      balanceAfter: Math.round((availableBalance - amount) * 100),
      metadata: {
        source: 'withdrawal',
        method: 'ach',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    })

    const response = {
      success: true,
      transactionId,
      amount,
      balance: availableBalance - amount,
      status: 'pending',
      timestamp: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      databaseId: transaction._id,
      message: 'Your withdrawal request has been processed. It will arrive in 2-3 business days.',
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process withdrawal' },
      { status: 500 }
    )
  }
}
