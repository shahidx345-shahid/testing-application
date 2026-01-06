import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { User, EmailVerification } from "@/lib/models/auth.model"
import { sendWelcomeEmail } from "@/lib/email-service"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Find user and verification record
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const verification = await EmailVerification.findOne({
      userId: user._id,
      expiresAt: { $gt: new Date() },
    })

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new code." },
        { status: 429 }
      )
    }

    // Verify code against hash
    const isCodeValid = await bcrypt.compare(code, verification.codeHash)

    if (!isCodeValid) {
      // Increment attempts
      verification.attempts += 1
      verification.lastAttempt = new Date()
      await verification.save()
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      )
    }

    // Mark email as verified
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { emailVerified: true },
      { new: true }
    )

    // Send welcome email
    if (updatedUser) {
      await sendWelcomeEmail(updatedUser.email, updatedUser.firstName || "User")
    }

    // Delete verification record
    await EmailVerification.deleteOne({ _id: verification._id })

    return NextResponse.json(
      {
        message: "Email verified successfully",
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    )
  }
}
