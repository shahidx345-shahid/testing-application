import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { User, EmailVerification } from "@/lib/models/auth.model"
import { sendVerificationEmail } from "@/lib/email-service"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete existing verification codes for this user
    await EmailVerification.deleteMany({ userId: user._id })

    // Generate verification code (6-digit)
    const code = crypto.randomInt(100000, 999999).toString()
    const codeHash = await bcrypt.hash(code, 10)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Save verification code to database
    const emailVerification = new EmailVerification({
      userId: user._id,
      email: email.toLowerCase(),
      code,
      codeHash,
      expiresAt,
      attempts: 0,
    })

    await emailVerification.save()

    // Send verification email
    const emailSent = await sendVerificationEmail(email, code)

    return NextResponse.json(
      {
        message: "Verification code sent successfully",
        code: process.env.NODE_ENV === "development" ? code : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Send verification error:", error)
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    )
  }
}
