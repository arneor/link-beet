'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { authApi } from '@/lib/api/auth';
import { useToast } from './use-toast';
import type { LoginCredentials, SignupCredentials, OTPVerification } from '@/types/auth';
import { setAuthCookie, removeAuthCookie } from '@/lib/cookies';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { user, tokens, setUser, setTokens, logout: clearAuth, updateUser } = useAuthStore();
  const { reset: resetOnboarding } = useOnboardingStore();

  // Get current user query
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.getMe(tokens?.accessToken!),
    enabled: !!tokens?.accessToken && !user,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.tokens);
      setAuthCookie(data.user, data.tokens);
      queryClient.setQueryData(['user'], data.user);

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });

      // Navigate based on onboarding status
      const isOnboardingComplete = data.user.onboardingCompleted || (data.requiresOnboarding === false);

      if (!isOnboardingComplete) {
        const nextStep = determineOnboardingStep(data.user);
        router.push(`/onboarding/${nextStep}`);
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => authApi.signup(credentials),
    onSuccess: (data) => {
      toast({
        title: 'OTP sent',
        description: `We've sent a verification code to ${data.email}`,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error: Error) => {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // OTP verification mutation
  const verifyOTPMutation = useMutation({
    mutationFn: (data: OTPVerification) => authApi.verifyOTP(data),
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.tokens);
      setAuthCookie(data.user, data.tokens);
      queryClient.setQueryData(['user'], data.user);

      toast({
        title: 'Email verified',
        description: 'Your account has been created!',
      });

      // Start onboarding
      router.push('/onboarding/category');
    },
    onError: (error: Error) => {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Resend OTP mutation
  const resendOTPMutation = useMutation({
    mutationFn: (email: string) => authApi.resendOTP(email),
    onSuccess: () => {
      toast({
        title: 'OTP resent',
        description: 'A new verification code has been sent to your email.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to resend OTP',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Google auth mutation
  const googleAuthMutation = useMutation({
    mutationFn: (credential: string) => authApi.googleAuth(credential),
    onSuccess: (data) => {
      setUser(data.user);
      setTokens(data.tokens);
      setAuthCookie(data.user, data.tokens);
      queryClient.setQueryData(['user'], data.user);

      toast({
        title: 'Login successful',
        description: 'Welcome!',
      });

      // Navigate based on onboarding status
      const isOnboardingComplete = data.user.onboardingCompleted || (data.requiresOnboarding === false);

      if (!isOnboardingComplete) {
        const nextStep = determineOnboardingStep(data.user);
        if (nextStep === 'dashboard') {
          router.push('/dashboard');
        } else {
          router.push(`/onboarding/${nextStep}`);
        }
      } else {
        router.push('/dashboard');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(tokens?.accessToken!),
    onSuccess: () => {
      clearAuth();
      removeAuthCookie();
      resetOnboarding();
      queryClient.clear();
      router.push('/login');

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    },
  });

  return {
    user: user || currentUser,
    isLoading,
    isAuthenticated: !!user || !!currentUser,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    verifyOTP: verifyOTPMutation.mutate,
    resendOTP: resendOTPMutation.mutate,
    googleAuth: googleAuthMutation.mutate,
    logout: logoutMutation.mutate,
    updateUser,
    isLoginLoading: loginMutation.isPending,
    isSignupLoading: signupMutation.isPending,
    isVerifyingOTP: verifyOTPMutation.isPending,
    isResendingOTP: resendOTPMutation.isPending,
    isGoogleAuthLoading: googleAuthMutation.isPending,
  };
}

// Helper to determine next onboarding step
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function determineOnboardingStep(user: any): string {
  if (!user.category) return 'category';

  const category = user.category.toLowerCase();

  // Business specific check
  if (category === 'business') {
    if (!user.businessId && !user.hasBusiness) return 'profile';
  }

  // Check for profile completion (displayName for creators, businessName for business)
  // Simplified check: if neither exists, profile is incomplete
  if (!user.displayName && !user.businessName) return 'profile';
  if (!user.username) return 'username';

  // If all info is present, go to dashboard
  return 'dashboard';
}
