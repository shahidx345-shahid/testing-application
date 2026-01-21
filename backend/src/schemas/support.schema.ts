import { z } from 'zod';

export const createSupportTicketSchema = z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject cannot exceed 200 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message cannot exceed 2000 characters'),
    category: z.enum(['account', 'payment', 'technical', 'kyc', 'withdrawal', 'general', 'bug_report']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    attachments: z.array(z.string().url()).max(5, 'Maximum 5 attachments allowed').optional()
});

export const sendChatMessageSchema = z.object({
    message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
    ticketId: z.string().optional()
});

export const updateTicketSchema = z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});
