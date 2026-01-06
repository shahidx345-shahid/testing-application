/**
 * Security Settings API Route
 * /api/account/security
 */

import { NextRequest, NextResponse } from 'next/server'

// PUT /api/account/security - Change password, email, or phone
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, currentPassword, newPassword, newEmail, newPhone, otpCode } = body

    // Validate type
    if (!['password', 'email', 'phone'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid security change type' },
        { status: 400 }
      )
    }

    // Change password
    if (type === 'password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Current and new password are required' },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }

      // In production: verify current password hash and update
      return NextResponse.json(
        { success: true, message: 'Password changed successfully' },
        { status: 200 }
      )
    }

    // Change email
    if (type === 'email') {
      if (!newEmail || !otpCode) {
        return NextResponse.json(
          { success: false, error: 'New email and OTP code are required' },
          { status: 400 }
        )
      }

      // In production: verify OTP and update email
      return NextResponse.json(
        { success: true, message: 'Email changed successfully' },
        { status: 200 }
      )
    }

    // Change phone
    if (type === 'phone') {
      if (!newPhone || !otpCode) {
        return NextResponse.json(
          { success: false, error: 'New phone and OTP code are required' },
          { status: 400 }
        )
      }

      // In production: verify OTP and update phone
      return NextResponse.json(
        { success: true, message: 'Phone changed successfully' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Security update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update security settings' },
      { status: 500 }
    )
  }
}
