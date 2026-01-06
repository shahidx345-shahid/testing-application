/**
 * Document Upload API Route
 * /api/kyc/documents
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get auth token from cookie first, then Bearer
    let token = request.cookies.get('authToken')?.value
    if (!token) {
      const authHeader = request.headers.get('authorization')
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

    // Verify JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const userId = decoded.userId

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!documentType || !['id_front', 'id_back', 'selfie', 'address_proof'].includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Get or create KYC status record
    const { KYCStatus } = await import('@/lib/models/UserProfile')
    let kycStatus = await KYCStatus.findOne({ userId })

    if (!kycStatus) {
      kycStatus = await KYCStatus.create({
        userId,
        status: 'not_started',
        completionPercentage: 0,
        idVerification: {},
        selfieVerification: {},
        addressVerification: {}
      })
    }

    // Save document reference to MongoDB
    const documentUrl = `/uploads/documents/${documentType}-${Date.now()}.${file.type.split('/')[1]}`
    const uploadedAt = new Date()

    switch (documentType) {
      case 'id_front':
        if (!kycStatus.idVerification) {
          kycStatus.idVerification = { status: 'not_started' }
        }
        kycStatus.idVerification.frontDocument = {
          url: documentUrl,
          uploadedAt
        }
        break
      case 'id_back':
        if (!kycStatus.idVerification) {
          kycStatus.idVerification = { status: 'not_started' }
        }
        kycStatus.idVerification.backDocument = {
          url: documentUrl,
          uploadedAt
        }
        break
      case 'selfie':
        if (!kycStatus.selfieVerification) {
          kycStatus.selfieVerification = { status: 'not_started' }
        }
        kycStatus.selfieVerification.selfieImage = {
          url: documentUrl,
          uploadedAt
        }
        break
      case 'address_proof':
        if (!kycStatus.addressVerification) {
          kycStatus.addressVerification = { status: 'not_started' }
        }
        kycStatus.addressVerification.proofDocument = {
          url: documentUrl,
          documentType: 'utility_bill',
          uploadedAt
        }
        break
    }

    // Calculate completion percentage based on uploaded documents
    const verification = kycStatus
    let completedDocs = 0

    if (verification.idVerification?.frontDocument) completedDocs++
    if (verification.idVerification?.backDocument) completedDocs++
    if (verification.selfieVerification?.selfieImage) completedDocs++
    if (verification.addressVerification?.proofDocument) completedDocs++

    kycStatus.completionPercentage = (completedDocs / 4) * 100

    // Update status to pending if documents are being uploaded
    if (completedDocs > 0 && kycStatus.status === 'not_started') {
      kycStatus.status = 'pending'
    }

    await kycStatus.save()

    const uploadedDocument = {
      documentType,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: uploadedAt.toISOString(),
      status: 'pending_review',
      url: documentUrl,
    }

    return NextResponse.json(
      { success: true, data: uploadedDocument, completionPercentage: kycStatus.completionPercentage },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get auth token from cookie first, then Bearer
    let token = request.cookies.get('authToken')?.value
    if (!token) {
      const authHeader = request.headers.get('authorization')
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

    // Verify JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const userId = decoded.userId

    // Get KYC status record from database
    const { KYCStatus } = await import('@/lib/models/UserProfile')
    const kycStatus = await KYCStatus.findOne({ userId })

    if (!kycStatus) {
      return NextResponse.json(
        { success: true, data: [] },
        { status: 200 }
      )
    }

    // Build documents array from MongoDB
    const documents: any[] = []
    const verification = kycStatus

    if (verification.idVerification?.frontDocument) {
      documents.push({
        documentType: 'id_front',
        uploadedAt: verification.idVerification.frontDocument.uploadedAt?.toISOString() || new Date().toISOString(),
        status: verification.idVerification.status || 'pending_review',
        url: verification.idVerification.frontDocument.url
      })
    }

    if (verification.idVerification?.backDocument) {
      documents.push({
        documentType: 'id_back',
        uploadedAt: verification.idVerification.backDocument.uploadedAt?.toISOString() || new Date().toISOString(),
        status: verification.idVerification.status || 'pending_review',
        url: verification.idVerification.backDocument.url
      })
    }

    if (verification.selfieVerification?.selfieImage) {
      documents.push({
        documentType: 'selfie',
        uploadedAt: verification.selfieVerification.selfieImage.uploadedAt?.toISOString() || new Date().toISOString(),
        status: verification.selfieVerification.status || 'pending_review',
        url: verification.selfieVerification.selfieImage.url
      })
    }

    if (verification.addressVerification?.proofDocument) {
      documents.push({
        documentType: 'address_proof',
        uploadedAt: verification.addressVerification.proofDocument.uploadedAt?.toISOString() || new Date().toISOString(),
        status: verification.addressVerification.status || 'pending_review',
        url: verification.addressVerification.proofDocument.url
      })
    }

    return NextResponse.json(
      { success: true, data: documents },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
