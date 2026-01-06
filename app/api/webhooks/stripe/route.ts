import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe inside request handler to ensure env vars are available at runtime
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set")
  }
  return new Stripe(apiKey, {
    apiVersion: "2024-11-20",
  } as any)
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    // Handle setup intent events
    switch (event.type) {
      case "setup_intent.succeeded": {
        const setupIntent = event.data.object as Stripe.SetupIntent
        // Optional: Update database to mark payment method as verified
        break
      }

      case "setup_intent.setup_failed": {
        const setupIntent = event.data.object as Stripe.SetupIntent
        console.error(`SetupIntent failed: ${setupIntent.id}`, setupIntent.last_setup_error)
        // Optional: Update database to mark payment method as failed
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        // Optional: Update database to mark payment as completed
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error(`PaymentIntent failed: ${paymentIntent.id}`)
        // Optional: Update database to mark payment as failed
        break
      }

      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer
        break
      }

      default:
        // Unhandled event type
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
