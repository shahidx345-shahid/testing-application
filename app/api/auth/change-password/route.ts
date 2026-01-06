import { NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AuthUser from '@/lib/models/AuthUser';
import { comparePasswords, hashPassword, isStrongPassword } from '@/lib/auth';
import { withAuth, apiSuccess, apiError } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  const auth = await withAuth(req);

  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return apiError('Missing required fields: oldPassword, newPassword, confirmPassword', 400);
    }

    if (newPassword !== confirmPassword) {
      return apiError('Passwords do not match', 400);
    }

    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      return apiError('New password does not meet requirements', 400, {
        requirements: passwordCheck.errors,
      });
    }

    await connectToDatabase();

    // Get user with password field
    const user = await AuthUser.findOne({ userId: auth.userId }).select('+password');

    if (!user) {
      return apiError('User not found', 404);
    }

    // Verify old password
    const isPasswordCorrect = await comparePasswords(oldPassword, user.password);

    if (!isPasswordCorrect) {
      return apiError('Current password is incorrect', 401);
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    return apiSuccess({ message: 'Password changed successfully' }, 200);
  } catch (error) {
    console.error('Change password error:', error);
    return apiError('Failed to change password', 500);
  }
}
