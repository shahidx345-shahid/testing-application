import express, { Response } from 'express';
import { User } from '../models/auth.model';
import { Wallet } from '../models/wallet.model';
import { connectDB } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// GET /api/save2740 - Get plan by ID (query parameter) or status
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const planId = req.query.id;

    // If planId is provided, return specific plan (for now, return status)
    const wallet = await Wallet.findOne({ userId: req.userId });

    res.json({
      success: true,
      data: {
        enrolled: true,
        planId: planId || `plan_${req.userId}`,
        startDate: wallet?.createdAt || new Date(),
        currentDay: wallet?.currentStreak || 1,
        totalDays: 365,
        dailyAmount: wallet?.dailySavingAmount || 27.4,
        totalSaved: wallet?.balance || 0,
        currentBalance: wallet?.balance || 0,
        targetCompletionDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        totalTargetAmount: (wallet?.dailySavingAmount || 27.4) * 365,
        currentStreak: wallet?.currentStreak || 0,
        missedDays: 0,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Get Save2740 plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get plan'
    });
  }
});

// GET /api/save2740/status - Get challenge status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    // In a real implementation this would fetch from a Challenge model
    // For now we derive it from wallet/user state
    const wallet = await Wallet.findOne({ userId: req.userId });

    res.json({
      success: true,
      data: {
        isActive: true, // Default to true
        currentDay: wallet?.currentStreak || 1,
        totalDays: 365,
        dailyAmount: wallet?.dailySavingAmount || 27.4,
        totalSaved: wallet?.balance || 0,
        targetAmount: (wallet?.dailySavingAmount || 27.4) * 365
      }
    });

  } catch (error) {
    console.error('Save2740 status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get challenge status'
    });
  }
});

// POST /api/save2740/join - Join the challenge
router.post('/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  // Logic to initialize challenge for user
  // For now success
  res.json({
    success: true,
    message: 'Joined Save2740 Challenge'
  });
});

// POST /api/save2740/contribute - Manual daily save trigger
router.post('/contribute', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const wallet = await Wallet.findOne({ userId: req.userId });

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    // Logic for saving daily amount
    const amount = wallet.dailySavingAmount || 27.4;

    // Simulate finding funds source and checking success
    // In real app, this would trigger payment gateway

    // Update wallet
    wallet.balance += amount;
    // Don't update availableBalance, keep it locked
    wallet.locked += amount;
    wallet.currentStreak += 1;
    wallet.lastSaveDate = new Date();
    await wallet.save();

    res.json({
      success: true,
      data: {
        message: `Successfully saved $${amount}`,
        newBalance: wallet.balance,
        streak: wallet.currentStreak
      }
    });

  } catch (error) {
    console.error('Daily save error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process daily save'
    });
  }
});

// POST /api/save2740/pause - Pause the challenge
router.post('/pause', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user preferences to mark challenge as paused
    if (!user.preferences) {
      user.preferences = {};
    }
    user.preferences.save2740Status = 'paused';
    await user.save();

    const wallet = await Wallet.findOne({ userId: req.userId });

    res.json({
      success: true,
      data: {
        planId: `plan_${req.userId}`,
        status: 'paused',
        balance: wallet?.balance || 0,
        message: 'Challenge paused successfully'
      }
    });

  } catch (error) {
    console.error('Pause challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause challenge'
    });
  }
});

// POST /api/save2740/resume - Resume the challenge
router.post('/resume', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user preferences to mark challenge as active
    if (!user.preferences) {
      user.preferences = {};
    }
    user.preferences.save2740Status = 'active';
    await user.save();

    const wallet = await Wallet.findOne({ userId: req.userId });

    res.json({
      success: true,
      data: {
        planId: `plan_${req.userId}`,
        status: 'active',
        balance: wallet?.balance || 0,
        message: 'Challenge resumed successfully'
      }
    });

  } catch (error) {
    console.error('Resume challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume challenge'
    });
  }
});

// POST /api/save2740/cancel - Cancel the challenge
router.post('/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { reason, withdrawBalance } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found'
      });
    }

    // Update user preferences to mark challenge as cancelled
    if (!user.preferences) {
      user.preferences = {};
    }
    user.preferences.save2740Status = 'cancelled';
    user.preferences.cancellationReason = reason;
    await user.save();

    // If withdrawBalance is true, move locked funds to available
    if (withdrawBalance) {
      wallet.availableBalance += wallet.locked;
      wallet.locked = 0;
      await wallet.save();
    }

    res.json({
      success: true,
      data: {
        planId: `plan_${req.userId}`,
        status: 'cancelled',
        balance: wallet.balance,
        message: 'Challenge cancelled successfully'
      }
    });

  } catch (error) {
    console.error('Cancel challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel challenge'
    });
  }
});

export default router;
