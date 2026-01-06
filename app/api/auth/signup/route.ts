import { NextRequest, NextResponse } from "next/server";
import { User, EmailVerification } from "@/lib/models/auth.model";
import { Wallet } from "@/lib/models/wallet.model";
import {
  validateEmail,
  validatePassword,
  generateEmailVerificationCode,
  hashCode,
  sendEmailVerification,
  checkRateLimit,
} from "@/lib/auth-utils";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password, firstName, selectedChallenge, multiplier } =
      await req.json();

    // Validate required fields
    if (!email || !password || !firstName) {
      console.error("Missing required fields:", { email: !!email, password: !!password, firstName: !!firstName });
      return NextResponse.json(
        { success: false, error: "Email, password, and firstName are required" },
        { status: 400 }
      );
    }

    // Validate email
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors.join(". ") },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(`signup_${email}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { success: false, error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already registered",
        },
        { status: 409 }
      );
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      firstName: firstName,
      lastName: firstName,
      passwordHash: password, // Will be hashed by the model's pre-save hook
      accountStatus: "active",
      emailVerified: false,
    });

    await user.save();

    // Determine daily saving amount based on challenge
    let dailySavingAmount = 27.4; // default daily
    if (selectedChallenge === "weekly") {
      dailySavingAmount = 191.80 / 7; // weekly divided by 7
    } else if (selectedChallenge === "monthly") {
      dailySavingAmount = 849.40 / 30; // monthly divided by 30
    }
    
    if (multiplier) {
      dailySavingAmount *= multiplier;
    }

    // Create wallet for new user
    await Wallet.create({
      userId: user._id.toString(),
      balance: 0,
      availableBalance: 0,
      locked: 0,
      lockedInPockets: 0,
      referralEarnings: 0,
      currentStreak: 0,
      dailySavingAmount: dailySavingAmount,
    });

    // Generate email verification code
    const verificationCode = generateEmailVerificationCode();
    const verificationHash = hashCode(verificationCode);

    await EmailVerification.create({
      userId: user._id,
      email: email.toLowerCase(),
      code: verificationCode,
      codeHash: verificationHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send verification email
    await sendEmailVerification(email, verificationCode);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please verify your email.",
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.emailVerified,
          },
          requiresEmailVerification: true,
          verificationCodeSent: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during signup. Please try again." },
      { status: 500 }
    );
  }
}
