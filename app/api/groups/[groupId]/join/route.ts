import { NextRequest, NextResponse } from 'next/server'

/**
 * Group Join API Route
 * POST /api/groups/[groupId]/join - Join a group using referral code
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
    const { referralCode, referredBy } = body

    // Validate referral code
    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // In production:
    // 1. Verify the referral code matches the group
    // 2. Check if user is already a member
    // 3. Add user to group members
    // 4. Update referral tracking if provided

    const newMember = {
      id: `member-${Date.now()}`,
      name: 'New Member',
      email: 'newmember@example.com',
      contributionAmount: 27.40,
      totalContributed: 0,
      referredBy: referredBy || null,
      joinedAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined group',
        data: {
          groupId,
          member: newMember,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error joining group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join group' },
      { status: 500 }
    )
  }
}
