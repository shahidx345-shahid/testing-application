/**
 * API Route: GET /api/payment-methods
 * Retrieve all payment methods for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

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
    const user = await AuthUser.findById(userId).select('stripeCustomerId email')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // If user doesn't have a Stripe customer ID, create one
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const { createStripeCustomer } = await import('@/lib/stripe')
      const customer = await createStripeCustomer(userId, user.email)
      stripeCustomerId = customer.id

      // Save to database
      user.stripeCustomerId = stripeCustomerId
      await user.save()
    }

    // Get payment methods from Stripe
    const { listPaymentMethods } = await import('@/lib/stripe')
    const paymentMethods = await listPaymentMethods(stripeCustomerId, 'card')

    // Get default payment method from customer
    const { getStripeCustomer } = await import('@/lib/stripe')
    const customer = await getStripeCustomer(stripeCustomerId)
    const defaultPaymentMethodId = (customer as any).invoice_settings?.default_payment_method

    // Format response
    const formattedMethods = paymentMethods.data.map((method: any) => ({
      id: method.id,
      type: 'card',
      provider: 'stripe',
      cardBrand: method.card?.brand || 'unknown',
      cardLastFour: method.card?.last4,
      cardExpMonth: method.card?.exp_month,
      cardExpYear: method.card?.exp_year,
      cardHolderName: method.billing_details?.name,
      isDefault: method.id === defaultPaymentMethodId,
      isVerified: true,
      createdAt: new Date(method.created * 1000),
    }))

    return NextResponse.json(
      { success: true, data: formattedMethods },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

/**
 * API Route: POST /api/payment-methods
 * Create a setup intent for adding a new payment method
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()

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
    const user = await AuthUser.findById(userId).select('stripeCustomerId email')

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // If user doesn't have a Stripe customer ID, create one
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const { createStripeCustomer } = await import('@/lib/stripe')
      const customer = await createStripeCustomer(userId, user.email)
      stripeCustomerId = customer.id

      // Save to database
      user.stripeCustomerId = stripeCustomerId
      await user.save()
    }

    // Create setup intent for adding payment method
    const { createSetupIntent } = await import('@/lib/stripe')
    const setupIntent = await createSetupIntent(stripeCustomerId)

    return NextResponse.json(
      { 
        success: true, 
        data: {
          clientSecret: setupIntent.client_secret,
          setupIntentId: setupIntent.id,
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating setup intent:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create setup intent' },
      { status: 500 }
    )
  }
}
