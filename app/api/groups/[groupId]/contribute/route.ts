import { NextRequest, NextResponse } from 'next/server'

/**
 * Group Contribution API Route
 * POST /api/groups/[groupId]/contribute - Record a contribution and update wallet
 * GET /api/groups/[groupId]/transactions - Get all transactions for a group
 */

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groupId = params.groupId
    const body = await request.json()
    const { memberId, amount, description } = body

    // Validate contribution amount
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid contribution amount' },
        { status: 400 }
      )
    }

    const contributionAmount = parseFloat(amount)

    // In production:
    // 1. Verify member belongs to group
    // 2. Create transaction record
    // 3. Update group balance
    // 4. Update member's wallet balance
    // 5. Record in ledger for real-time updates

    const transaction = {
      id: `txn-${Date.now()}`,
      groupId,
      memberId: memberId || 'current-user',
      amount: contributionAmount,
      description: description || 'Group contribution',
      type: 'contribution',
      status: 'completed',
      createdAt: new Date().toISOString(),
    }

    // Update wallet (in production, call wallet service)
    const walletUpdate = {
      userId: memberId || 'current-user',
      previousBalance: 1000, // Mock previous balance
      amount: contributionAmount,
      newBalance: 1000 + contributionAmount,
      transactionId: transaction.id,
      description: `Group contribution to ${groupId}`,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Contribution recorded successfully',
        data: {
          transaction,
          walletUpdate,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing contribution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process contribution' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const groupId = params.groupId

    // In production: Fetch transactions from database
    // const transactions = await db.transactions.find({ groupId })

    const mockTransactions = [
      {
        id: 'txn-1',
        groupId,
        memberId: 'm1',
        memberName: 'John Doe',
        amount: 27.40,
        description: 'Weekly contribution',
        type: 'contribution',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
      {
        id: 'txn-2',
        groupId,
        memberId: 'm2',
        memberName: 'Jane Smith',
        amount: 27.40,
        description: 'Weekly contribution',
        type: 'contribution',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: mockTransactions,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
