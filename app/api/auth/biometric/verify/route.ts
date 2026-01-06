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

    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Credential required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update user with biometric credential
    // In production, you'd verify the credential and store the public key
    const user = await AuthUser.findByIdAndUpdate(
      auth.userId,
      {
        biometricEnabled: true,
        biometricCredential: credential.id,
        biometricType: 'platform',
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Biometric credential verified',
    });
  } catch (error) {
    console.error('Biometric verify error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify biometric credential' },
      { status: 500 }
    );
  }
}
