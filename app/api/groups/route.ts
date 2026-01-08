import { NextRequest, NextResponse } from 'next/server'

/**
 * Groups API Route
 * POST /api/groups - Create a new group
 * GET /api/groups - Get all groups for the current user
 */

// Generate unique referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Generate referral link
function generateReferralLink(code: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'https://save2740.app'}/join/${code}`
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { groupName, purpose, contributionAmount, frequency } = body

    // Validate required fields
    if (!groupName || !purpose || !contributionAmount || !frequency) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate frequency
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json(
        { success: false, error: 'Invalid frequency' },
        { status: 400 }
      )
    }

    // Validate contribution amount
    const amount = parseFloat(contributionAmount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid contribution amount' },
        { status: 400 }
      )
    }

    // Generate referral code and link
    const referralCode = generateReferralCode()
    const referralLink = generateReferralLink(referralCode)

    // Create group object (replace with database save in production)
    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      purpose,
      contributionAmount: amount,
      frequency,
      referralCode,
      referralLink,
      members: [],
      balance: 0,
      totalContributed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In production: Save to database
    // await db.groups.create(newGroup)

    return NextResponse.json(
      {
        success: true,
        message: 'Group created successfully',
        data: newGroup,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create group' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In production: Fetch from database filtered by user ID
    // const groups = await db.groups.find({ creatorId: userId })

    // Mock data for now
    const mockGroups = [
      {
        id: 'group-1',
        name: 'Friends Circle',
        purpose: 'Quarterly vacation fund',
        contributionAmount: 27.40,
        frequency: 'weekly',
        referralCode: 'FC2024',
        referralLink: 'https://save2740.app/join/FC2024',
        balance: 1096,
        totalContributed: 2192,
        members: 4,
        createdAt: '2024-01-15',
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: mockGroups,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}
