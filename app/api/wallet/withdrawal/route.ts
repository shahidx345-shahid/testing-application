// app/api/wallet/withdrawal/route.ts - Withdrawal endpoints

import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/wallet/withdrawal
 * Request a withdrawal from wallet to bank account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, bankAccountId } = body

    // Validation
    if (!amount || amount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal is $10" },
        { status: 400 }
      )
    }

    // In production:
    // 1. Verify bank account is linked
    // 2. Verify sufficient balance
    // 3. Create Dwolla/ACH transfer
    // 4. Create withdrawal ledger entry
    // 5. Deduct from wallet balance

    const withdrawal = {
      id: `wtd-${Date.now()}`,
      amount,
      status: "pending",
      bankAccountId,
      timestamp: new Date().toISOString(),
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      transactionId: `WTD-${Date.now()}`,
    }

    return NextResponse.json(withdrawal)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/wallet/withdrawal?status=pending
 * Get withdrawal history
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") // "pending", "completed", "failed"

    // In production, fetch from database
    const withdrawals = [
      {
        id: "1",
        amount: 274.0,
        status: "completed",
        bankAccount: "Chase •••• 6789",
        transactionId: "WTD-2025-001",
        timestamp: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ withdrawals })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    )
  }
}
