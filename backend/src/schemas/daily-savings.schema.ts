import { z } from 'zod';

export const createDailySavingSchema = z.object({
    amount: z.number().min(1, 'Amount must be at least $1').max(1000, 'Daily savings cannot exceed $1,000'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    note: z.string().max(200, 'Note cannot exceed 200 characters').optional(),
    paymentMethodId: z.string().optional()
});

export const dailySavingsQuerySchema = z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    page: z.number().min(1).default(1).optional(),
    limit: z.number().min(1).max(100).default(30).optional()
});
