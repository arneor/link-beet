import type { User } from '@/types/auth';
import type { CategorySelection, ProfileData, UsernameSelection } from '@/types/onboarding';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mark-morph.onrender.com/api';

async function apiRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Request failed');
    }

    return response.json();
}

export const onboardingApi = {
    // Update category
    async updateCategory(token: string, data: CategorySelection): Promise<User> {
        return apiRequest<User>('/auth/onboarding/category', token, {
            method: 'POST',
            body: JSON.stringify({ category: data.category.toUpperCase() }),
        });
    },

    // Update profile
    async updateProfile(token: string, data: ProfileData): Promise<User> {
        return apiRequest<User>('/auth/onboarding/complete', token, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Set username
    async setUsername(token: string, data: UsernameSelection): Promise<User> {
        return apiRequest<User>('/auth/username/claim', token, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Check username availability
    checkUsername: async (username: string): Promise<{ isValid: boolean; isAvailable: boolean; errors: string[]; suggestions?: string[] }> => {
        const response = await fetch(
            `${API_BASE_URL}/auth/username/check`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            }
        );
        return response.json();
    },
};
