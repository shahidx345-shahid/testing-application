import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { PhoneVerification } from "@/lib/models/phone-verification.model"
import { sendVerificationSMS } from "@/lib/sms-service"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber || phoneNumber.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      )
    }

    await connectDB()

    // Delete existing OTP for this phone
    await PhoneVerification.deleteMany({ phoneNumber })

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Save OTP to database
    const phoneVerification = new PhoneVerification({
      phoneNumber,
      otp,
      expiresAt,
      attempts: 0,
    })

    await phoneVerification.save()

    // Send verification SMS
    const smsSent = await sendVerificationSMS(phoneNumber, otp)

    return NextResponse.json(
      {
        message: "OTP sent to phone number",
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Send phone OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
