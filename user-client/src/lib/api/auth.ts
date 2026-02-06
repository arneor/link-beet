import type {
    LoginCredentials,
    SignupCredentials,
    OTPVerification,
    User,
    AuthTokens
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mark-morph.onrender.com/api';

class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.message || 'Request failed',
            response.status,
            errorData.code
        );
    }

    return response.json();
}

export const authApi = {
    // Login
    login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens; requiresOnboarding?: boolean }> => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Signup (sends OTP)
    signup: async (credentials: SignupCredentials): Promise<{ success: boolean; email: string }> => {
        return apiRequest('/auth/signup/initiate', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // Verify OTP
    verifyOTP: async (data: OTPVerification): Promise<{ user: User; tokens: AuthTokens; requiresOnboarding?: boolean }> => {
        return apiRequest('/auth/signup/verify', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Resend OTP
    resendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
        return apiRequest('/auth/otp/resend', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Google Sign-in
    googleAuth: async (credential: string): Promise<{ user: User; tokens: AuthTokens; requiresOnboarding?: boolean }> => {
        return apiRequest('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        });
    },

    // Get current user
    getMe: async (token: string): Promise<User> => {
        return apiRequest('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    // Logout
    logout: async (token: string): Promise<{ success: boolean }> => {
        return apiRequest('/auth/logout', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
