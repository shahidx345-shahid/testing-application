import express, { Response } from 'express';
import { Group } from '../models/group.model';
import { User } from '../models/auth.model';
import { Wallet } from '../models/wallet.model';
import { Transaction } from '../models/transaction.model';
import { connectDB } from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/groups - List user's groups
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    // Find groups where user is a member
    const groups = await Group.find({
      'members.userId': req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('List groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list groups'
    });
  }
});

// POST /api/groups - Create a new group
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const {
      name,
      purpose,
      contributionAmount,
      frequency,
      maxMembers,
      startDate,
      payoutOrderRule
    } = req.body;

    if (!name || !contributionAmount) {
      return res.status(400).json({
        success: false,
        error: 'Name and contribution amount are required'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate invite code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create new group
    const group = new Group({
      name,
      purpose: purpose || `${name} Savings Group`,
      contributionAmount,
      frequency: frequency || 'monthly',
      maxMembers: maxMembers || 10,
      payoutOrderRule: payoutOrderRule || 'as-joined',
      startDate: startDate || new Date(),
      status: 'open',
      joinCode,
      referralLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${joinCode}`,

      creatorId: user._id,
      creatorEmail: user.email,

      currentMembers: 1,
      members: [{
        userId: user._id,
        name: `${user.firstName} ${user.lastName || ''}`.trim(),
        email: user.email,
        joinedAt: new Date(),
        totalContributed: 0,
        payoutPosition: 1
      }]
    });

    await group.save();

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create group'
    });
  }
});

// GET /api/groups/:id - Get group details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is member
    const isMember = group.members.some(
      (m: any) => m.userId.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not a member of this group'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get group'
    });
  }
});

// POST /api/groups/join - Join a group via code
router.post('/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();

    const { joinCode } = req.body; // Changed from inviteCode

    if (!joinCode) {
      return res.status(400).json({
        success: false,
        error: 'Join code is required'
      });
    }

    const group = await Group.findOne({ joinCode: joinCode.toUpperCase() });

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Invalid join code'
      });
    }

    // Check if already a member
    const isMember = group.members.some(
      (m: any) => m.userId.toString() === req.userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'Already a member of this group'
      });
    }

    // Check capacity
    if (group.members.length >= (group.maxMembers || 10)) {
      return res.status(400).json({
        success: false,
        error: 'Group is full'
      });
    }

    // Get user details
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Add member
    group.members.push({
      userId: user._id, // Mongoose handles casting automatically for document updates
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      email: user.email,
      joinedAt: new Date(),
      totalContributed: 0,
      payoutPosition: group.members.length + 1
    });

    group.currentMembers = group.members.length;

    if (group.currentMembers >= group.maxMembers) {
      group.status = 'filled';
      group.filledDate = new Date();
    }

    await group.save();

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join group'
    });
  }
});

// POST /api/groups/leave - Leave a group
router.post('/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group ID is required' 
      });
    }

    // Validate groupId format
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid group ID format' 
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        error: 'Group not found' 
      });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.userId.toString() === req.userId);
    
    if (!isMember) {
      return res.status(400).json({ 
        success: false, 
        error: 'You are not a member of this group' 
      });
    }

    // Remove the user from members
    group.members = group.members.filter(m => m.userId.toString() !== req.userId);
    group.currentMembers = group.members.length;

    // If group is now empty, mark as completed
    if (group.members.length === 0) {
      group.status = 'completed';
    }

    await group.save();

    res.json({ 
      success: true, 
      message: 'Successfully left group',
      data: {
        groupId: group._id,
        remainingMembers: group.members.length
      }
    });

  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to leave group',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

// POST /api/groups/:id/contribute - Contribute to a group
router.post('/:id/contribute', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { amount, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid group ID format'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is a member
    const member = group.members.find(m => m.userId.toString() === req.userId);
    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    // Check wallet balance
    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet || wallet.availableBalance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.userId,
      type: 'debit',
      amount,
      description: description || 'Group contribution',
      status: 'completed',
      metadata: {
        groupId,
        groupName: group.name,
        contributionType: 'group'
      }
    });

    // Update wallet
    wallet.availableBalance -= amount;
    wallet.locked += amount;
    await wallet.save();

    // Update member contribution
    member.totalContributed = (member.totalContributed || 0) + amount;

    // Update group totals
    group.totalBalance = (group.totalBalance || 0) + amount;
    await group.save();

    // Get user for member name
    const user = await User.findById(req.userId);

    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction._id,
          memberId: req.userId,
          memberName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          amount,
          date: new Date().toISOString(),
          description: description || 'Group contribution',
          status: 'completed'
        }
      }
    });

  } catch (error) {
    console.error('Group contribution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process contribution'
    });
  }
});

// GET /api/groups/:id/transactions - Get group transactions
router.get('/:id/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid group ID format'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    // Get all transactions for this group
    const transactions = await Transaction.find({
      'metadata.groupId': groupId
    }).sort({ createdAt: -1 });

    // Populate with member names
    const enrichedTransactions = await Promise.all(
      transactions.map(async (txn) => {
        const user = await User.findById(txn.userId);
        return {
          id: txn._id,
          memberId: txn.userId,
          memberName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          amount: txn.amount,
          date: txn.createdAt.toISOString(),
          description: txn.description,
          status: txn.status
        };
      })
    );

    res.json({
      success: true,
      data: enrichedTransactions
    });

  } catch (error) {
    console.error('Get group transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

// POST /api/groups/:id/join - Alternative join route
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { referralCode, referredBy } = req.body;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid group ID format'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Verify referral code if provided
    if (referralCode && group.joinCode !== referralCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid referral code'
      });
    }

    // Check if already a member
    const isMember = group.members.some(m => m.userId.toString() === req.userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'Already a member of this group'
      });
    }

    // Check if group is full
    if (group.currentMembers >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        error: 'Group is full'
      });
    }

    // Get user details for the member
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add member
    group.members.push({
      userId: new mongoose.Types.ObjectId(req.userId),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      joinedAt: new Date(),
      totalContributed: 0,
      payoutPosition: group.currentMembers + 1
    });

    group.currentMembers += 1;

    if (group.currentMembers >= group.maxMembers) {
      group.status = 'filled';
      group.filledDate = new Date();
    }

    await group.save();

    res.json({
      success: true,
      data: {
        groupId: group._id,
        groupName: group.name,
        yourPosition: group.currentMembers,
        contributionAmount: group.contributionAmount,
        frequency: group.frequency
      }
    });

  } catch (error) {
    console.error('Join group (alt) error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join group'
    });
  }
});

// POST /api/groups/:id/leave - Alternative leave route
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await connectDB();
    const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid group ID format'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const isMember = group.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    group.members = group.members.filter(m => m.userId.toString() !== req.userId);
    group.currentMembers = group.members.length;

    if (group.members.length === 0) {
      group.status = 'completed';
    }

    await group.save();

    res.json({
      success: true,
      message: 'Successfully left group',
      data: {
        groupId: group._id,
        remainingMembers: group.members.length
      }
    });

  } catch (error) {
    console.error('Leave group (alt) error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave group'
    });
  }
});

export default router;
