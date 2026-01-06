/**
 * Wallet API Route - Freeze Account
 * /api/wallet/freeze
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
    const { userId, reason, duration } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Reason is required' },
        { status: 400 }
      )
    }

    const freezeDate = new Date()
    const unfreezeDate = new Date(Date.now() + (duration || 24) * 60 * 60 * 1000)

    // Record freeze action in transaction history
    const freezeTransaction = await Transaction.create({
      userId,
      type: 'freeze',
      amount: 0,
      currency: 'USD',
      status: 'completed',
      description: `Wallet frozen: ${reason}`,
      metadata: {
        freezeReason: reason,
        freezeDate: freezeDate.toISOString(),
        unfreezeDate: unfreezeDate.toISOString(),
        duration: duration || 24
      }
    })

    const response = {
      success: true,
      message: 'Wallet has been frozen',
      freezeDate: freezeDate.toISOString(),
      reason,
      duration: duration || 24,
      willUnfreezeAt: unfreezeDate.toISOString(),
      databaseId: freezeTransaction._id,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Freeze wallet error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to freeze wallet' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const { userId, verificationCode } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    const unfreezeDate = new Date()

    // Record unfreeze action in transaction history
    const unfreezeTransaction = await Transaction.create({
      userId,
      type: 'unfreeze',
      amount: 0,
      currency: 'USD',
      status: 'completed',
      description: 'Wallet unfrozen',
      metadata: {
        unfreezeDate: unfreezeDate.toISOString()
      }
    })

    const response = {
      success: true,
      message: 'Wallet has been unfrozen',
      unfreezeDate: unfreezeDate.toISOString(),
      databaseId: unfreezeTransaction._id,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Unfreeze wallet error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unfreeze wallet' },
      { status: 500 }
    )
  }
}
