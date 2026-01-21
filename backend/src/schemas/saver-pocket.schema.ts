import { z } from 'zod';

export const createSaverPocketSchema = z.object({
    name: z.string().min(3, 'Pocket name must be at least 3 characters').max(50, 'Pocket name cannot exceed 50 characters'),
    goalAmount: z.number().min(10, 'Goal amount must be at least $10').max(1000000, 'Goal amount cannot exceed $1,000,000'),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format').optional(),
    description: z.string().max(300, 'Description cannot exceed 300 characters').optional(),
    category: z.enum(['emergency', 'vacation', 'electronics', 'education', 'wedding', 'car', 'home', 'other']).default('other'),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
    autoSave: z.boolean().default(false),
    autoSaveAmount: z.number().min(1).optional()
});

export const updateSaverPocketSchema = z.object({
    name: z.string().min(3).max(50).optional(),
    goalAmount: z.number().min(10).max(1000000).optional(),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    description: z.string().max(300).optional(),
    category: z.enum(['emergency', 'vacation', 'electronics', 'education', 'wedding', 'car', 'home', 'other']).optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    autoSave: z.boolean().optional(),
    autoSaveAmount: z.number().min(1).optional(),
    status: z.enum(['active', 'paused', 'completed', 'cancelled']).optional()
});

export const addToPocketSchema = z.object({
    amount: z.number().min(1, 'Amount must be at least $1')
});

export const withdrawFromPocketSchema = z.object({
    amount: z.number().min(1, 'Amount must be at least $1'),
    reason: z.string().max(200).optional()
});
