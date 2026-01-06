import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Save2740Plan } from '@/lib/models/save2740.model';
import jwt from 'jsonwebtoken';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Resolve params (Next.js 15+ requires awaiting)
    const { id } = await params;

    // Get token from httpOnly cookie or Authorization header
    let token = request.cookies.get('authToken')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, dailyAmount, multiplier, targetAmount } = await request.json();

    if (!name || !dailyAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the save2740 plan
    const plan = await Save2740Plan.findOne({ _id: id, userId });

    if (!plan) {
      return NextResponse.json(
        { error: 'Pocket not found' },
        { status: 404 }
      );
    }

    // Update fields
    plan.name = name;
    plan.dailyAmount = parseFloat(dailyAmount);
    plan.multiplier = parseInt(multiplier) || 1;
    
    // Only update targetAmount if provided
    if (targetAmount) {
      plan.targetAmount = parseFloat(targetAmount);
      plan.totalTargetAmount = parseFloat(targetAmount);
    }

    await plan.save();

    const pocket = {
      id: plan._id.toString(),
      name: plan.name,
      dailyContribution: (plan.dailyAmount || 0).toFixed(2),
      multiplier: `x${plan.multiplier || 1}`,
      saved: (plan.amountSaved || 0).toFixed(2),
      progress: plan.targetAmount ? Math.min(100, Math.round((plan.amountSaved / plan.targetAmount) * 100)) : 0,
      targetAmount: (plan.targetAmount || 0).toFixed(2),
    };

    return NextResponse.json({
      success: true,
      data: pocket,
    });
  } catch (error) {
    console.error('Error updating saver pocket:', error);
    return NextResponse.json(
      { error: 'Failed to update saver pocket' },
      { status: 500 }
    );
  }
}
