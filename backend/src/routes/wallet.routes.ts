import express, { Response } from 'express';
import { Wallet } from '../models/wallet.model';
import { Transaction } from '../models/transaction.model';
import { connectDB } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { depositSchema, withdrawSchema } from '../schemas/wallet.schema';
import { paymentLimiter } from '../middleware/rate-limiters';

const router = express.Router();

// GET /api/wallet - Get wallet details
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    let wallet = await Wallet.findOne({ userId: req.userId });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.userId,
        balance: 0,
        availableBalance: 0,
        locked: 0,
        lockedInPockets: 0,
        referralEarnings: 0,
        currentStreak: 0,
        dailySavingAmount: 27.4
      });
    }

    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet'
    });
  }
});

// GET /api/wallet/transactions - Get transaction history
router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 for performance

    res.json({
      success: true,
      data: {
        transactions,
        total: transactions.length
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
});

// POST /api/wallet/deposit - Add money to wallet
router.post('/deposit', authenticateToken, paymentLimiter, validate(depositSchema), async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const { amount, paymentMethodId, currency } = req.body;

    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // In production: Process payment via Stripe/payment processor here
    // For now, simulate successful payment

    // 1. Create Transaction Record
    const transaction = await Transaction.create({
      userId: req.userId,
      type: 'deposit',
      amount: amount,
      status: 'completed',
      description: 'Wallet Deposit',
      paymentMethodId: paymentMethodId || 'manual',
      metadata: {
        currency: currency || 'usd',
        source: 'wallet_deposit'
      }
    });

    // 2. Update Wallet
    wallet.balance += amount;
    wallet.availableBalance += amount;
    await wallet.save();

    res.json({
      success: true,
      message: `Successfully deposited $${amount}`,
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deposit'
    });
  }
});

// POST /api/wallet/withdraw - Withdraw money from wallet
router.post('/withdraw', authenticateToken, paymentLimiter, validate(withdrawSchema), async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const { amount, bankAccountId, reason } = req.body;

    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient available balance'
      });
    }

    // In production: Initiate payout via Stripe/payment processor
    // Create transaction as 'pending' initially, then update after processing

    // 1. Create Transaction (start as pending)
    const transaction = await Transaction.create({
      userId: req.userId,
      type: 'withdraw',
      amount: amount,
      status: 'pending',
      description: reason || 'Wallet Withdrawal',
      paymentMethodId: bankAccountId,
      metadata: {
        reason,
        requestedAt: new Date()
      }
    });

    // 2. Update Wallet (lock the amount)
    wallet.availableBalance -= amount;
    // For now, also reduce balance. In production, keep in 'pending_withdrawal'
    wallet.balance -= amount;
    await wallet.save();

    // In production: Process withdrawal asynchronously
    // For now, mark as completed immediately
    transaction.status = 'completed';
    await transaction.save();

    res.json({
      success: true,
      message: `Withdrawal of $${amount} initiated successfully`,
      data: {
        wallet,
        transaction
      }
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw'
    });
  }
});

// GET /api/wallet/limits - Get wallet transaction limits
router.get('/limits', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get today's deposits
    const todayDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: 'deposit',
          createdAt: { $gte: today },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get today's withdrawals
    const todayWithdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: 'withdrawal',
          createdAt: { $gte: today },
          status: { $in: ['completed', 'processing', 'pending'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get monthly deposits
    const monthlyDeposits = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: 'deposit',
          createdAt: { $gte: monthStart },
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get monthly withdrawals
    const monthlyWithdrawals = await Transaction.aggregate([
      {
        $match: {
          userId: req.userId,
          type: 'withdrawal',
          createdAt: { $gte: monthStart },
          status: { $in: ['completed', 'processing', 'pending'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const limits = {
      daily: {
        deposit: {
          limit: 5000,
          used: todayDeposits[0]?.total || 0,
          remaining: 5000 - (todayDeposits[0]?.total || 0)
        },
        withdrawal: {
          limit: 1000,
          used: todayWithdrawals[0]?.total || 0,
          remaining: 1000 - (todayWithdrawals[0]?.total || 0)
        }
      },
      monthly: {
        deposit: {
          limit: 50000,
          used: monthlyDeposits[0]?.total || 0,
          remaining: 50000 - (monthlyDeposits[0]?.total || 0)
        },
        withdrawal: {
          limit: 10000,
          used: monthlyWithdrawals[0]?.total || 0,
          remaining: 10000 - (monthlyWithdrawals[0]?.total || 0)
        }
      }
    };
    
    res.json({ success: true, data: limits });
  } catch (error) {
    console.error('Get wallet limits error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch limits'
    });
  }
});

export default router;
