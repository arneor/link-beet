import { z } from 'zod';

export const categorySchema = z.object({
    category: z.enum(['creator', 'business']),
});

export const creatorProfileSchema = z.object({
    displayName: z.string().min(2, 'Name must be at least 2 characters').max(50),
    creatorType: z.string().min(1, 'Please select a category'),
    bio: z.string().max(200, 'Bio must be less than 200 characters').optional(),
});

export const businessProfileSchema = z.object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
    businessType: z.enum(['RESTAURANT_CAFE', 'RETAIL_STORE', 'SALON_SPA', 'GYM_FITNESS', 'HOTEL_HOSTEL', 'OTHER']),
    location: z.string().min(2, 'Location is required'),
});

export const usernameSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
        .refine((val) => !val.startsWith('-') && !val.endsWith('-'),
            'Username cannot start or end with a hyphen'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type UsernameInput = z.infer<typeof usernameSchema>;
