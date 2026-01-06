/**
 * API Route: DELETE /api/payment-methods/[id]
 * Delete a payment method
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id: paymentMethodId } = await params

    // Get token from httpOnly cookie
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

    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const userId = decoded.userId

    // Get user from database
    const AuthUser = mongoose.models.AuthUser || (await import('@/lib/models/AuthUser')).default
    const user = await AuthUser.findById(userId).select('stripeCustomerId')

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Detach payment method from Stripe
    const { detachPaymentMethod } = await import('@/lib/stripe')
    await detachPaymentMethod(paymentMethodId)

    return NextResponse.json(
      { success: true, message: 'Payment method deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}

/**
 * API Route: PATCH /api/payment-methods/[id]
 * Set payment method as default
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id: paymentMethodId } = await params
    const body = await request.json()
    const { isDefault } = body

    // Get token from httpOnly cookie
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

    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    const userId = decoded.userId

    // Get user from database
    const AuthUser = mongoose.models.AuthUser || (await import('@/lib/models/AuthUser')).default
    const user = await AuthUser.findById(userId).select('stripeCustomerId')

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (isDefault) {
      // Set as default payment method
      const { setDefaultPaymentMethod } = await import('@/lib/stripe')
      await setDefaultPaymentMethod(user.stripeCustomerId, paymentMethodId)
    }

    return NextResponse.json(
      { success: true, message: 'Payment method updated successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update payment method' },
      { status: 500 }
    )
  }
}
