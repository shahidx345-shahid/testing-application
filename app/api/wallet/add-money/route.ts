/**
 * Wallet API Route - Add Money (Top-up)
 * /api/wallet/add-money
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Transaction } from '@/lib/models/transaction'
import { Wallet } from '@/lib/models/wallet.model'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    
    // Verify JWT token
    let userId
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, paymentMethodId, description } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (amount > 50000) {
      return NextResponse.json(
        { success: false, error: 'Amount exceeds maximum limit of PKR 50,000' },
        { status: 400 }
      )
    }

    if (amount < 1) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit is PKR 1' },
        { status: 400 }
      )
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Calculate fee (2.9% + 0.30 PKR)
    const fee = Math.round((amount * 0.029 + 0.30) * 100) / 100
    const netAmount = amount - fee

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Get current wallet balance
    const wallet = await Wallet.findOne({ userId })
    const balanceBefore = wallet?.balance || 0

    // Create transaction record in MongoDB
    const transaction = await Transaction.create({
      userId,
      type: 'deposit',
      amount: Math.round(amount * 100), // Store in cents
      currency: 'PKR',
      status: 'completed',
      paymentMethodId,
      transactionId,
      fee: Math.round(fee * 100),
      netAmount: Math.round(netAmount * 100),
      description: description || 'Wallet deposit',
      balanceBefore: Math.round(balanceBefore * 100),
      balanceAfter: Math.round((balanceBefore + netAmount) * 100),
      metadata: {
        source: 'deposit',
        paymentProcessor: 'stripe'
      }
    })

    // Update wallet balance
    if (wallet) {
      wallet.balance += netAmount
      wallet.availableBalance += netAmount
      wallet.totalBalance = wallet.balance + wallet.locked + wallet.referralEarnings
      await wallet.save()
    } else {
      // Create wallet if doesn't exist
      await Wallet.create({
        userId,
        balance: netAmount,
        availableBalance: netAmount,
        locked: 0,
        lockedInPockets: 0,
        referralEarnings: 0,
        currentStreak: 0,
        dailySavingAmount: 27.4,
      })
    }

    const response = {
      success: true,
      transactionId,
      amount,
      fee,
      netAmount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      databaseId: transaction._id,
      nextSteps: ['Your deposit will appear in 1-2 business days', 'Check your email for receipt'],
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Add money error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process deposit' },
      { status: 500 }
    )
  }
}
