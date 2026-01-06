import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { User } from "@/lib/models/auth.model"
import { PhoneVerification } from "@/lib/models/phone-verification.model"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, otp } = await request.json()

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP required" },
        { status: 400 }
      )
    }

    await connectDB()

    // Find phone verification record
    const verification = await PhoneVerification.findOne({
      phoneNumber,
      otp,
      expiresAt: { $gt: new Date() },
    })

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      )
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      )
    }

    // Update user phone
    await User.findOneAndUpdate(
      { phoneNumber },
      { phoneVerified: true },
      { new: true }
    )

    // Delete verification record
    await PhoneVerification.deleteOne({ _id: verification._id })
    return NextResponse.json(
      {
        message: "Phone verified successfully",
        success: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Phone verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify phone" },
      { status: 500 }
    )
  }
}
