import express from 'express';
import Stripe from 'stripe';
import { connectDB } from '../config/db';
import { Transaction } from '../models/transaction.model';
import { Wallet } from '../models/wallet.model';
import { getStripeProcessor } from '../utils/stripe-processor';

const router = express.Router();

// Stripe Webhook Handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
        console.warn('⚠️  Stripe Webhook Secret not configured');
        return res.status(400).json({
            success: false,
            error: 'Webhook Secret not configured'
        });
    }

    let event: Stripe.Event;

    try {
        const stripeProcessor = getStripeProcessor();
        const stripe = stripeProcessor.getStripeInstance();
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({
            success: false,
            error: `Webhook Error: ${err.message}`
        });
    }

    try {
        await connectDB();

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            case 'charge.refunded':
                await handleChargeRefunded(event.data.object as Stripe.Charge);
                break;

            case 'customer.created':
                console.log('Customer created:', event.data.object.id);
                break;

            case 'payment_method.attached':
                console.log('Payment method attached:', event.data.object.id);
                break;

            case 'payment_method.detached':
                console.log('Payment method detached:', event.data.object.id);
                break;

            default:
                console.log(`ℹ️  Unhandled event type: ${event.type}`);
        }

        res.json({ received: true, eventType: event.type });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
});

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    try {
        const userId = paymentIntent.metadata?.userId;
        const transactionType = paymentIntent.metadata?.transactionType || 'deposit';

        if (!userId) {
            console.error('No userId in payment intent metadata');
            return;
        }

        // Find or create transaction
        let transaction = await Transaction.findOne({
            externalTransactionId: paymentIntent.id
        });

        if (!transaction) {
            // Create new transaction
            transaction = await Transaction.create({
                userId,
                type: transactionType,
                amount: paymentIntent.amount / 100, // Convert from cents
                status: 'completed',
                description: `Stripe ${transactionType}`,
                externalTransactionId: paymentIntent.id,
                paymentMethodId: paymentIntent.payment_method as string,
                metadata: {
                    stripePaymentIntentId: paymentIntent.id,
                    currency: paymentIntent.currency
                }
            });
        } else {
            // Update existing transaction
            transaction.status = 'completed';
            await transaction.save();
        }

        // Update wallet if deposit
        if (transactionType === 'deposit') {
            const wallet = await Wallet.findOne({ userId });
            if (wallet) {
                const amount = paymentIntent.amount / 100;
                wallet.balance += amount;
                wallet.availableBalance += amount;
                await wallet.save();
                console.log(`✅ Wallet updated for user ${userId}: +$${amount}`);
            }
        }

        console.log(`✅ Payment intent succeeded: ${paymentIntent.id}`);
    } catch (error) {
        console.error('Error handling payment intent succeeded:', error);
    }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    try {
        const userId = paymentIntent.metadata?.userId;

        if (!userId) {
            console.error('No userId in failed payment intent metadata');
            return;
        }

        // Update transaction status
        await Transaction.findOneAndUpdate(
            { externalTransactionId: paymentIntent.id },
            {
                status: 'failed',
                metadata: {
                    stripePaymentIntentId: paymentIntent.id,
                    failureReason: paymentIntent.last_payment_error?.message
                }
            }
        );

        console.log(`❌ Payment intent failed: ${paymentIntent.id}`);
    } catch (error) {
        console.error('Error handling payment intent failed:', error);
    }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
    try {
        const paymentIntentId = charge.payment_intent as string;

        // Find original transaction
        const transaction = await Transaction.findOne({
            externalTransactionId: paymentIntentId
        });

        if (!transaction) {
            console.error('Transaction not found for refund');
            return;
        }

        // Create refund transaction
        await Transaction.create({
            userId: transaction.userId,
            type: 'refund',
            amount: charge.amount_refunded / 100,
            status: 'completed',
            description: 'Stripe Refund',
            externalTransactionId: charge.id,
            metadata: {
                originalTransactionId: transaction._id.toString(),
                stripeChargeId: charge.id
            }
        });

        // Update wallet
        const wallet = await Wallet.findOne({ userId: transaction.userId });
        if (wallet) {
            const refundAmount = charge.amount_refunded / 100;
            wallet.balance -= refundAmount;
            wallet.availableBalance -= refundAmount;
            await wallet.save();
        }

        console.log(`✅ Charge refunded: ${charge.id}`);
    } catch (error) {
        console.error('Error handling charge refunded:', error);
    }
}

export default router;
