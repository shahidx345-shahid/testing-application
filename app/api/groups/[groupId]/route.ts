import { NextRequest, NextResponse } from 'next/server'

/**
 * Group Detail API Route
 * GET /api/groups/[groupId] - Get group details
 * PUT /api/groups/[groupId] - Update group settings
 * DELETE /api/groups/[groupId] - Delete group
 * POST /api/groups/[groupId]/join - Join a group with referral code
 */

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

    // In production: Fetch from database
    // const group = await db.groups.findById(groupId)

    // Mock data
    const mockGroup = {
      id: groupId,
      name: 'Friends Circle',
      purpose: 'Quarterly vacation fund',
      contributionAmount: 27.40,
      frequency: 'weekly',
      referralCode: 'FC2024',
      referralLink: 'https://save2740.app/join/FC2024',
      balance: 1096,
      totalContributed: 2192,
      members: [
        {
          id: 'm1',
          name: 'John Doe',
          email: 'john@example.com',
          contributionAmount: 27.40,
          totalContributed: 274,
          joinedAt: '2024-01-15',
        },
      ],
      createdAt: '2024-01-15',
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: mockGroup,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    // Validate update fields
    const allowedUpdates = ['name', 'purpose', 'frequency']
    const updates = Object.keys(body).filter(key => allowedUpdates.includes(key))

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // In production: Update in database
    // const updatedGroup = await db.groups.findByIdAndUpdate(groupId, body)

    return NextResponse.json(
      {
        success: true,
        message: 'Group updated successfully',
        data: { id: groupId, ...body },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // In production: Delete from database
    // await db.groups.findByIdAndDelete(groupId)

    return NextResponse.json(
      {
        success: true,
        message: 'Group deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}
