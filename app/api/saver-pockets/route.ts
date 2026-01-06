import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Save2740Plan } from '@/lib/models/save2740.model';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    // Fetch all save2740 plans for the user
    const plans = await Save2740Plan.find({ userId, status: 'active' }).lean();

    const pockets = plans.map((plan: any) => ({
      id: plan._id.toString(),
      name: plan.name,
      dailyContribution: (plan.dailyAmount || 0).toFixed(2),
      multiplier: `x${plan.multiplier || 1}`,
      saved: (plan.amountSaved || 0).toFixed(2),
      progress: plan.targetAmount ? Math.min(100, Math.round((plan.amountSaved / plan.targetAmount) * 100)) : 0,
      targetAmount: (plan.targetAmount || 0).toFixed(2),
      startDate: plan.startDate,
      endDate: plan.endDate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        pockets,
        total: pockets.length,
      },
    });
  } catch (error) {
    console.error('Error fetching saver pockets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saver pockets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    if (!name || !dailyAmount || !targetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new save2740 plan
    const startDate = new Date();
    const targetCompletionDate = new Date();
    targetCompletionDate.setFullYear(targetCompletionDate.getFullYear() + 1); // 1 year from now
    
    const newPlan = new Save2740Plan({
      userId,
      name,
      dailyAmount: parseFloat(dailyAmount),
      multiplier: parseInt(multiplier) || 1,
      targetAmount: parseFloat(targetAmount),
      totalTargetAmount: parseFloat(targetAmount),
      amountSaved: 0,
      savingsMode: 'daily',
      targetCompletionDate,
      status: 'active',
      startDate,
    });

    await newPlan.save();

    const pocket = {
      id: newPlan._id.toString(),
      name: newPlan.name,
      dailyContribution: (newPlan.dailyAmount || 0).toFixed(2),
      multiplier: `x${newPlan.multiplier || 1}`,
      saved: (newPlan.amountSaved || 0).toFixed(2),
      progress: 0,
      targetAmount: (newPlan.targetAmount || 0).toFixed(2),
    };

    return NextResponse.json({
      success: true,
      data: pocket,
    });
  } catch (error) {
    console.error('Error creating saver pocket:', error);
    return NextResponse.json(
      { error: 'Failed to create saver pocket' },
      { status: 500 }
    );
  }
}
