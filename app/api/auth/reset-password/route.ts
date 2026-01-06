import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/auth.model'
import { PasswordResetToken } from '@/lib/models/password-reset.model'
import bcrypt from 'bcryptjs'

/**
 * POST /api/auth/reset-password
 * Reset user password using OTP verification
 */
export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, OTP, and new password are required' },
        { status: 400 }
      )
    }

    // Validate OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'OTP must be 6 digits' },
        { status: 400 }
      )
    }

    // Validate password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      // For security, don't reveal if user exists
      return NextResponse.json(
        { success: false, error: 'Invalid email or OTP' },
        { status: 400 }
      )
    }

    // Find password reset token
    const resetToken = await PasswordResetToken.findOne({
      userId: user._id.toString(),
      email: email.toLowerCase(),
    })

    if (!resetToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (new Date() > resetToken.expiresAt) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id })
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check attempt limit
    if (resetToken.attempts >= 5) {
      await PasswordResetToken.deleteOne({ _id: resetToken._id })
      return NextResponse.json(
        { success: false, error: 'Too many failed attempts. Please request a new OTP.' },
        { status: 400 }
      )
    }

    // Verify OTP
    const otpMatch = await bcrypt.compare(otp, resetToken.codeHash)

    if (!otpMatch) {
      // Increment attempts
      resetToken.attempts += 1
      resetToken.lastAttempt = new Date()
      await resetToken.save()

      const attemptsRemaining = 5 - resetToken.attempts
      return NextResponse.json(
        {
          success: false,
          error: `Invalid OTP. ${attemptsRemaining} attempts remaining.`,
        },
        { status: 400 }
      )
    }

    // Update user password (model's pre-save hook will hash it)
    user.passwordHash = newPassword
    await user.save()

    // Delete reset token
    await PasswordResetToken.deleteOne({ _id: resetToken._id })

    return NextResponse.json(
      { success: true, message: 'Password reset successful! You can now login with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
