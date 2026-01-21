import express, { Response } from 'express';
import { Transaction } from '../models/transaction.model';
import { User } from '../models/auth.model';
import { connectDB } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

import { validate } from '../middleware/validate';
import { createPaymentIntentSchema } from '../schemas/payment.schema';
import { paymentLimiter } from '../middleware/rate-limiters';

const router = express.Router();

// GET /api/payments - same as wallet transactions but maybe with filters
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('List payments error:', error);
    res.status(500).json({ success: false, error: 'Failed' });
  }
});

// POST /api/payments/intent - Create payment intent
router.post('/intent', authenticateToken, paymentLimiter, validate(createPaymentIntentSchema), async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const { amount, currency = 'usd' } = req.body;

    // Use Stripe if available, otherwise mock
    try {
      const { getStripeProcessor } = require('../utils/stripe-processor');
      const stripeProcessor = getStripeProcessor();

      // Create payment intent with Stripe
      const { clientSecret, paymentIntentId } = await stripeProcessor.createPaymentIntent(
        Math.round(amount * 100), // Convert to cents
        currency,
        undefined, // customerId - TODO: link to Stripe customer
        {
          userId: req.userId,
          transactionType: 'deposit'
        }
      );

      res.json({
        success: true,
        data: {
          clientSecret,
          paymentIntentId,
          amount,
          currency
        }
      });
    } catch (stripeError: any) {
      console.warn('Stripe not available, using mock:', stripeError.message);
      
      // Fallback to mock
      res.json({
        success: true,
        data: {
          clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
          amount,
          currency,
          mock: true
        }
      });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment intent' });
  }
});

// GET /api/payments/auto-debit - Get auto-debit configuration
router.get('/auto-debit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get auto-debit configuration from user preferences
    const autoDebitConfig = user.preferences?.autoDebit || {
      enabled: false,
      amount: 27.40,
      frequency: 'daily',
      paymentMethodId: null
    };

    res.json({
      success: true,
      data: {
        enabled: autoDebitConfig.enabled || false,
        amount: autoDebitConfig.amount || 27.40,
        frequency: autoDebitConfig.frequency || 'daily',
        paymentMethodId: autoDebitConfig.paymentMethodId || null,
        nextDebitDate: autoDebitConfig.nextDebitDate || new Date()
      }
    });

  } catch (error) {
    console.error('Get auto-debit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get auto-debit configuration'
    });
  }
});

// POST /api/payments/auto-debit - Setup or update auto-debit
router.post('/auto-debit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { enabled, amount, frequency, paymentMethodId } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate next debit date based on frequency
    let nextDebitDate = new Date();
    if (frequency === 'daily') {
      nextDebitDate.setDate(nextDebitDate.getDate() + 1);
    } else if (frequency === 'weekly') {
      nextDebitDate.setDate(nextDebitDate.getDate() + 7);
    } else if (frequency === 'monthly') {
      nextDebitDate.setMonth(nextDebitDate.getMonth() + 1);
    }

    // Update user preferences
    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences.autoDebit = {
      enabled: enabled !== undefined ? enabled : true,
      amount: amount || 27.40,
      frequency: frequency || 'daily',
      paymentMethodId: paymentMethodId || null,
      nextDebitDate
    };

    await user.save();

    res.json({
      success: true,
      data: {
        enabled: user.preferences.autoDebit.enabled,
        amount: user.preferences.autoDebit.amount,
        frequency: user.preferences.autoDebit.frequency,
        paymentMethodId: user.preferences.autoDebit.paymentMethodId,
        nextDebitDate: user.preferences.autoDebit.nextDebitDate
      },
      message: enabled ? 'Auto-debit enabled successfully' : 'Auto-debit updated successfully'
    });

  } catch (error) {
    console.error('Setup auto-debit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup auto-debit'
    });
  }
});

export default router;
