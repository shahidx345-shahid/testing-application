import { z } from 'zod';

export const joinChallengeSchema = z.object({
    challengeType: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    multiplier: z.number().min(1).max(10).default(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    autoDebit: z.boolean().default(false)
});

export const contributeSchema = z.object({
    amount: z.number().min(1, 'Amount must be at least $1'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    paymentMethodId: z.string().optional()
});

export const updateChallengeSchema = z.object({
    multiplier: z.number().min(1).max(10).optional(),
    autoDebit: z.boolean().optional(),
    paused: z.boolean().optional()
});
