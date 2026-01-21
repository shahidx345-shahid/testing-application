import { z } from 'zod';

export const updateProfileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        country: z.string().optional()
    }).optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    preferences: z.object({
        notifications: z.object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
            sms: z.boolean().optional(),
            marketing: z.boolean().optional(),
            security: z.boolean().optional()
        }).optional(),
        language: z.string().optional(),
        currency: z.string().optional()
    }).optional()
});

export const updateAvatarSchema = z.object({
    avatarUrl: z.string().min(1, 'Avatar URL is required')
});
