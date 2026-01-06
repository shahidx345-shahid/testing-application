import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
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

    // For now, returning mock data. This should be replaced with actual database queries
    // once the Support Ticket model is created
    const tickets = [
      {
        id: "TKT-2026-001",
        subject: "Unable to complete daily savings deposit",
        category: "Payments & Wallet",
        status: "in-progress",
        priority: "high",
        createdAt: "Jan 5, 2026",
        lastUpdated: "2 hours ago",
        messages: 3,
      },
      {
        id: "TKT-2026-002",
        subject: "Question about referral rewards",
        category: "General Inquiry",
        status: "resolved",
        priority: "low",
        createdAt: "Jan 3, 2026",
        lastUpdated: "1 day ago",
        messages: 5,
      },
      {
        id: "TKT-2026-003",
        subject: "2FA setup not working",
        category: "Account & Security",
        status: "closed",
        priority: "medium",
        createdAt: "Jan 1, 2026",
        lastUpdated: "3 days ago",
        messages: 7,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        total: tickets.length,
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
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

    const { subject, category, priority, message } = await request.json();

    if (!subject || !category || !priority || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Save ticket to database
    return NextResponse.json({
      success: true,
      data: {
        id: `TKT-2026-${Date.now()}`,
        subject,
        category,
        priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        message: 'Ticket created successfully',
      },
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
