/**
 * Account Deletion API Route
 * /api/account/delete
 */

import { NextRequest, NextResponse } from 'next/server'

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
    const { password, reason, deleteData } = body

    // Validate inputs
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required to delete account' },
        { status: 400 }
      )
    }

    // In production:
    // 1. Verify password
    // 2. Check for active transactions/balances
    // 3. Archive data if needed
    // 4. Delete all user data if deleteData is true
    // 5. Send confirmation email
    // 6. Invalidate all sessions

    const accountDeletion = {
      status: 'scheduled_for_deletion',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancellationToken: `cancel-${Date.now()}`,
      reason,
      dataDeletedPermanently: deleteData,
      message: 'Your account will be deleted in 30 days. You can cancel this request by logging in and visiting your account settings.',
    }

    return NextResponse.json(
      { success: true, data: accountDeletion },
      { status: 200 }
    )
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cancellationToken } = body

    if (!cancellationToken) {
      return NextResponse.json(
        { success: false, error: 'Cancellation token is required' },
        { status: 400 }
      )
    }

    // In production: verify token and cancel deletion
    return NextResponse.json(
      { success: true, message: 'Account deletion cancelled successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Cancellation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel account deletion' },
      { status: 500 }
    )
  }
}
