import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-helpers';
import { connectToDatabase } from '@/lib/mongodb';
import AuthUser from '@/lib/models/AuthUser';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Verify user exists
    const user = await AuthUser.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // In production, you'd generate a WebAuthn challenge here
    // For now, we'll return a mock challenge
    const challenge = Buffer.from('mock-challenge-' + Date.now()).toString('base64');
    const userId = Buffer.from(auth.userId || '').toString('base64');

    return NextResponse.json({
      success: true,
      challenge,
      userId,
    });
  } catch (error) {
    console.error('Biometric register error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start biometric registration' },
      { status: 500 }
    );
  }
}
