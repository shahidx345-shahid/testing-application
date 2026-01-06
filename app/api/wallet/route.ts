// app/api/wallet/route.ts - Wallet endpoints

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Wallet } from "@/lib/models/wallet.model"
import jwt from "jsonwebtoken"

/**
 * GET /api/wallet
 * Get user wallet balance and details
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from httpOnly cookie or Authorization header
    let token = request.cookies.get('authToken')?.value
    
    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any
    const userId = decoded.userId

    // Get wallet from database
    const wallet = await Wallet.findOne({ userId })

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: wallet.userId,
        balance: wallet.balance,
        availableBalance: wallet.availableBalance,
        locked: wallet.locked,
        lockedInPockets: wallet.lockedInPockets,
        referral: wallet.referralEarnings,
        referralEarnings: wallet.referralEarnings,
        totalBalance: wallet.totalBalance,
        lastDailySavingDate: wallet.lastDailySavingDate,
        currentStreak: wallet.currentStreak,
        dailySavingAmount: wallet.dailySavingAmount,
      }
    })
  } catch (error) {
    console.error("Wallet fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/wallet/fund
 * Add money to wallet (top-up)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, paymentMethodId, paymentType } = body

    // Validation
    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: "Minimum amount is $10" },
        { status: 400 }
      )
    }

    // In production:
    // 1. Verify payment method exists
    // 2. Call Stripe API to create payment intent
    // 3. Process payment
    // 4. Create wallet ledger entry
    // 5. Update wallet balance

    const transaction = {
      id: `txn-${Date.now()}`,
      type: "credit",
      amount,
      fee: paymentType === "card" ? Math.round((amount * 0.029 + 0.3) * 100) / 100 : Math.round((amount * 0.001) * 100) / 100,
      status: "completed",
      timestamp: new Date().toISOString(),
      description: "Wallet Top-Up",
    }

    return NextResponse.json(transaction)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}
