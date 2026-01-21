import express, { Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Backend routes matching frontend expectations
router.get('/messages', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { messages: [], session: null } });
});

router.post('/send', authenticateToken, (req: AuthRequest, res: Response) => {
  const { message, sessionId } = req.body;
  // Mock response - in real app would save to DB
  res.json({
    success: true,
    data: {
      sessionId: sessionId || 'mock-session-id',
      message: {
        _id: Date.now().toString(),
        sender: 'user',
        message,
        read: false,
        createdAt: new Date()
      }
    }
  });
});

router.patch('/messages', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true });
});

// Alias old routes if needed
router.get('/history', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: [] });
});

router.post('/message', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Message sent' });
});

export default router;
