/**
 * KYC Status API Route
 * /api/kyc/status
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get token from httpOnly cookie or Authorization header
    let token = request.cookies.get('authToken')?.value
    
    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    const userId = decoded.userId

    // Get KYC status from database
    const { KYCStatus } = await import('@/lib/models/UserProfile')
    
    let kycStatus = await KYCStatus.findOne({ userId: new mongoose.Types.ObjectId(userId) })

    // If no KYC record exists, create one with initial state
    if (!kycStatus) {
      kycStatus = await KYCStatus.create({
        userId: new mongoose.Types.ObjectId(userId),
        status: 'not_started',
        completionPercentage: 0,
      })
    }

    return NextResponse.json(
      { 
        success: true, 
        data: {
          status: kycStatus.status,
          completionPercentage: kycStatus.completionPercentage,
          verificationDate: kycStatus.lastVerificationDate,
          documents: {
            idFront: {
              status: kycStatus.idVerification?.status || 'not_started',
              uploadedAt: kycStatus.idVerification?.frontDocument?.uploadedAt,
              expiryDate: kycStatus.idVerification?.expiryDate,
            },
            idBack: {
              status: kycStatus.idVerification?.status || 'not_started',
              uploadedAt: kycStatus.idVerification?.backDocument?.uploadedAt,
            },
            selfie: {
              status: kycStatus.selfieVerification?.status || 'not_started',
              uploadedAt: kycStatus.selfieVerification?.selfieImage?.uploadedAt,
            },
            addressProof: {
              status: kycStatus.addressVerification?.status || 'not_started',
              uploadedAt: kycStatus.addressVerification?.proofDocument?.uploadedAt,
            },
          },
          limits: {
            dailyTransactionLimit: kycStatus.status === 'verified' ? 10000 : 1000,
            monthlyTransactionLimit: kycStatus.status === 'verified' ? 50000 : 5000,
            dailyWithdrawalLimit: kycStatus.status === 'verified' ? 5000 : 500,
          },
          nextReviewDate: kycStatus.expiryDate,
          rejectionReason: kycStatus.idVerification?.rejectionReason || null,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('KYC status fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KYC status' },
      { status: 500 }
    )
  }
}
