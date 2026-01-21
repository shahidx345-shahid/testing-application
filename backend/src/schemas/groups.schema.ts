import { z } from 'zod';

export const createGroupSchema = z.object({
    name: z.string().min(3, 'Group name must be at least 3 characters').max(50, 'Group name cannot exceed 50 characters'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
    goalAmount: z.number().min(100, 'Goal amount must be at least $100').max(1000000, 'Goal amount cannot exceed $1,000,000'),
    memberLimit: z.number().min(2, 'Minimum 2 members').max(100, 'Maximum 100 members').default(10),
    contributionFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    minContribution: z.number().min(1, 'Minimum contribution must be at least $1').optional(),
    isPrivate: z.boolean().default(false),
    category: z.enum(['savings', 'investment', 'emergency', 'vacation', 'other']).optional()
});

export const joinGroupSchema = z.object({
    groupId: z.string().min(1, 'Group ID is required'),
    inviteCode: z.string().optional()
});

export const leaveGroupSchema = z.object({
    groupId: z.string().min(1, 'Group ID is required'),
    reason: z.string().max(200).optional()
});

export const contributeToGroupSchema = z.object({
    groupId: z.string().min(1, 'Group ID is required'),
    amount: z.number().min(1, 'Amount must be at least $1')
});
