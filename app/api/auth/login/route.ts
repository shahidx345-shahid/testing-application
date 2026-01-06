import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/auth.model';
import { connectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: email, password' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.accountStatus !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if account is locked (too many login attempts)
    if (user.accountStatus === 'locked') {
      return NextResponse.json(
        { success: false, error: 'Account is locked. Please try again later.' },
        { status: 429 }
      );
    }

    // Compare passwords using the model method
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLogin = new Date();

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.accountStatus = 'locked';
      }

      await user.save();
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    user.failedLoginAttempts = 0;
    user.accountStatus = 'active';
    user.lastLogin = new Date();

    // Save all changes to database
    await user.save();

    // Create real JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Store auth token in response and set httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          accountStatus: user.accountStatus,
        }
      },
      { status: 200 }
    );

    // Set httpOnly cookie with JWT token (secure, same-site)
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    );
  }
}
