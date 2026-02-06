'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { onboardingApi } from '@/lib/api/onboarding';
import { useToast } from './use-toast';
import { setAuthCookie } from '@/lib/cookies';
import type { User } from '@/types/auth';
import type { CategorySelection, ProfileData, UsernameSelection } from '@/types/onboarding';

export function useOnboarding() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();


    const { tokens, updateUser } = useAuthStore();
    const { setCategory, setProfileData, setUsername, setStep, getNextStep } = useOnboardingStore();

    // Category mutation
    const categoryMutation = useMutation({
        mutationFn: (data: CategorySelection) => {
            if (!tokens?.accessToken) throw new Error('User must be authenticated');
            return onboardingApi.updateCategory(tokens.accessToken, data);
        },
        onSuccess: (data: User, variables) => {
            setCategory(variables.category);
            updateUser(data); // Sync with backend state (step 2)
            if (tokens) setAuthCookie(data, tokens);
            setStep('profile');

            toast({
                title: 'Category saved',
                description: `You've selected ${variables.category}`,
            });

            router.push('/onboarding/profile');
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to save category',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Profile mutation
    const profileMutation = useMutation({
        mutationFn: (data: ProfileData) => {
            if (!tokens?.accessToken) throw new Error('User must be authenticated');
            return onboardingApi.updateProfile(tokens.accessToken, data);
        },
        onSuccess: (data: User, variables) => {
            setProfileData(variables);
            updateUser(data); // Sync with backend state (step 3)
            if (tokens) setAuthCookie(data, tokens);
            setStep('username');

            toast({
                title: 'Profile saved',
                description: 'Your profile information has been updated',
            });

            router.push('/onboarding/username');
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to save profile',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Username mutation
    const usernameMutation = useMutation({
        mutationFn: (data: UsernameSelection) => {
            if (!tokens?.accessToken) throw new Error('User must be authenticated');
            return onboardingApi.setUsername(tokens.accessToken, data);
        },
        onSuccess: async (data: User, variables) => {
            const updatedUser = { ...data, onboardingCompleted: true };
            setUsername(variables.username);
            updateUser(updatedUser); // Sync with backend state (step 4)
            if (tokens) setAuthCookie(updatedUser, tokens);

            setStep('complete');

            toast({
                title: 'Profile completed!',
                description: 'Your profile is ready.',
            });

            // Invalidate user query to refresh data
            queryClient.invalidateQueries({ queryKey: ['user'] });

            router.push('/dashboard');
        },
        onError: (error: Error) => {
            toast({
                title: 'Failed to save username',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    return {
        saveCategory: categoryMutation.mutate,
        saveProfile: profileMutation.mutate,
        saveUsername: usernameMutation.mutate,
        isSavingCategory: categoryMutation.isPending,
        isSavingProfile: profileMutation.isPending,
        isSavingUsername: usernameMutation.isPending,
        getNextStep,
    };
}

// Hook for checking username availability
export function useUsernameAvailability(username: string) {
    return useQuery({
        queryKey: ['username-available', username],
        queryFn: () => onboardingApi.checkUsername(username),
        enabled: username.length >= 3,
        staleTime: 0,
    });
}
