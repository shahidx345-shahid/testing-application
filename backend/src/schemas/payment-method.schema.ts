import { z } from 'zod';

export const addPaymentMethodSchema = z.object({
    type: z.enum(['card', 'bank_account', 'paypal']),
    // Card details
    cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number').optional(),
    cardholderName: z.string().min(3).optional(),
    expiryMonth: z.number().min(1).max(12).optional(),
    expiryYear: z.number().min(2024).max(2050).optional(),
    cvv: z.string().regex(/^\d{3,4}$/).optional(),
    // Bank account details
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    accountType: z.enum(['checking', 'savings']).optional(),
    bankName: z.string().optional(),
    // PayPal
    paypalEmail: z.string().email().optional(),
    // Common
    billingAddress: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string()
    }).optional(),
    isDefault: z.boolean().default(false),
    // Stripe payment method ID (if using Stripe)
    stripePaymentMethodId: z.string().optional()
});

export const updatePaymentMethodSchema = z.object({
    isDefault: z.boolean().optional(),
    billingAddress: z.object({
        street: z.string(),
        city: z.string(),
        state: z.string(),
        zipCode: z.string(),
        country: z.string()
    }).optional()
});
