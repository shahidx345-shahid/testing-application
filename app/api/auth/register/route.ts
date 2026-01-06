import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AuthUser from '@/lib/models/AuthUser';
import { hashPassword, isValidEmail, isStrongPassword, createToken, generateRandomToken } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phoneNumber } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return apiError('Missing required fields: email, password, firstName, lastName', 400);
    }

    if (!isValidEmail(email)) {
      return apiError('Invalid email format', 400);
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return apiError('Password does not meet requirements', 400, {
        requirements: passwordCheck.errors,
      });
    }

    // Connect to database
    await connectToDatabase();

    // Check if email already exists
    const existingUser = await AuthUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return apiError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate referral code
    const referralCode = `${firstName.toUpperCase()}_${Math.random().toString(36).substring(2, 7)}`;

    // Generate user ID
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create new user
    const newUser = new AuthUser({
      userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      referralCode,
      emailVerified: false,
      isActive: true,
    });

    await newUser.save();

    // Create token
    const token = createToken({
      userId: newUser.userId,
      email: newUser.email,
    });

    // Return user data (without password)
    const userResponse = {
      userId: newUser.userId,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      referralCode: newUser.referralCode,
      token,
      message: 'User registered successfully. Please verify your email.',
    };

    return apiSuccess(userResponse, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return apiError('Failed to register user', 500);
  }
}
