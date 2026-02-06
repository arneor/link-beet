import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingState, OnboardingStep } from '@/types/onboarding';

interface OnboardingStore extends OnboardingState {
    // Actions
    setStep: (step: OnboardingStep) => void;
    setCategory: (category: 'creator' | 'business') => void;
    setProfileData: (data: Partial<OnboardingState>) => void;
    setUsername: (username: string) => void;
    reset: () => void;
    getNextStep: () => OnboardingStep | null;
}

const initialState: OnboardingState = {
    currentStep: 'signup',
};

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setStep: (step) => set({ currentStep: step }),

            setCategory: (category) => set({ category }),

            setProfileData: (data) => set((state) => ({ ...state, ...data })),

            setUsername: (username) => set({ username }),

            reset: () => set(initialState),

            getNextStep: () => {
                const state = get();

                if (!state.email) return 'signup';
                if (!state.category) return 'category';
                if (!state.displayName && !state.businessName) return 'profile';
                if (!state.username) return 'username';
                return 'complete';
            },
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
