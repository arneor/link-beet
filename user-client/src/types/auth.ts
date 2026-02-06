export type UserCategory = 'creator' | 'business';

export interface User {
    id: string;
    email: string;
    username?: string;
    displayName?: string;
    category?: UserCategory;
    profilePicture?: string;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    createdAt: string;
    businessId?: string;
    hasBusiness?: boolean;
    role?: string;
    onboardingStep?: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    email: string;
    password: string;
}

export interface OTPVerification {
    email: string;
    otp: string;
}

export interface GoogleAuthResponse {
    credential: string;
    clientId: string;
}
