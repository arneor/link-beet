export interface OnboardingState {
    email?: string;
    category?: 'creator' | 'business';
    displayName?: string;
    businessName?: string;
    businessType?: string;
    location?: string;
    username?: string;
    bio?: string;
    creatorType?: string;
    currentStep: OnboardingStep;
}

export type OnboardingStep =
    | 'signup'
    | 'verify-otp'
    | 'category'
    | 'profile'
    | 'username'
    | 'complete';

export interface CategorySelection {
    category: 'creator' | 'business';
}

export interface ProfileData {
    displayName: string;
    businessName?: string;
    businessType?: string;
    location?: string;
    bio?: string;
    creatorType?: string;
}

export interface UsernameSelection {
    username: string;
}
