/**
 * Wallet API Route - Escrow Balance
 * /api/wallet/escrow
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

    // Query held/escrow transactions from MongoDB
    const heldTransactions = await Transaction.find({
      userId,
      status: 'held'
    })

    const escrowTransactions = heldTransactions.map(t => ({
      transactionId: t.transactionId,
      amount: (t.amount || 0) / 100,
      reason: t.description,
      releaseDate: t.metadata?.releaseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'held',
      databaseId: t._id
    }))

    const totalEscrow = heldTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / 100

    const escrow = {
      userId,
      totalEscrow,
      transactionCount: escrowTransactions.length,
      transactions: escrowTransactions,
    }

    return NextResponse.json(
      { success: true, escrow },
      { status: 200 }
    )
  } catch (error) {
    console.error('Fetch escrow error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch escrow balance' },
      { status: 500 }
    )
  }
}
