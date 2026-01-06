/**
 * Wallet API Route - Wallet Limits
 * /api/wallet/limits
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Transaction } from '@/lib/models/transaction'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get today's and current month's transactions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Query deposits and withdrawals from MongoDB
    const todayDeposits = await Transaction.find({
      userId,
      type: 'deposit',
      createdAt: { $gte: today }
    })

    const monthDeposits = await Transaction.find({
      userId,
      type: 'deposit',
      createdAt: { $gte: monthStart }
    })

    const todayWithdrawals = await Transaction.find({
      userId,
      type: 'withdrawal',
      createdAt: { $gte: today }
    })

    const monthWithdrawals = await Transaction.find({
      userId,
      type: 'withdrawal',
      createdAt: { $gte: monthStart }
    })

    const dailyDepositUsed = todayDeposits.reduce((sum, t) => sum + (t.amount || 0), 0) / 100
    const monthlyDepositUsed = monthDeposits.reduce((sum, t) => sum + (t.amount || 0), 0) / 100
    const dailyWithdrawalUsed = todayWithdrawals.reduce((sum, t) => sum + (t.amount || 0), 0) / 100
    const monthlyWithdrawalUsed = monthWithdrawals.reduce((sum, t) => sum + (t.amount || 0), 0) / 100

    const limits = {
      userId,
      dailyDepositLimit: 10000,
      dailyDepositUsed,
      monthlyDepositLimit: 50000,
      monthlyDepositUsed,
      dailyWithdrawalLimit: 5000,
      dailyWithdrawalUsed,
      monthlyWithdrawalLimit: 25000,
      monthlyWithdrawalUsed,
      singleTransactionLimit: 10000,
      minDepositAmount: 1,
      maxDepositAmount: 50000,
      minWithdrawalAmount: 10,
      maxWithdrawalAmount: 10000,
      lastResetDate: monthStart.toISOString(),
    }

    return NextResponse.json(
      { success: true, limits },
      { status: 200 }
    )
  } catch (error) {
    console.error('Fetch limits error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch limits' },
      { status: 500 }
    )
  }
}
