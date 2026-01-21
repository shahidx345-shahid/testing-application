import { z } from 'zod';

export const createNotificationSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    type: z.enum(['info', 'success', 'warning', 'error', 'achievement', 'reminder']),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    message: z.string().min(5, 'Message must be at least 5 characters').max(500),
    actionUrl: z.string().url().optional(),
    actionText: z.string().max(50).optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    expiresAt: z.date().optional()
});

export const markNotificationReadSchema = z.object({
    notificationId: z.string().min(1, 'Notification ID is required')
});

export const notificationQuerySchema = z.object({
    page: z.number().min(1).default(1).optional(),
    limit: z.number().min(1).max(100).default(20).optional(),
    unreadOnly: z.boolean().default(false).optional(),
    type: z.enum(['info', 'success', 'warning', 'error', 'achievement', 'reminder']).optional()
});
