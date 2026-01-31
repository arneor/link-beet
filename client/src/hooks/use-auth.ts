import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type User, type AuthResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useRequestOtp() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password?: string }) => {
      return authApi.login({ email, password: password || "" });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
    },
  });
}

export function useVerifyOtp() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      return authApi.verifyOtp(email, otp);
    },
    onSuccess: (data: AuthResponse) => {
      toast({
        title: "Welcome back!",
        description: "You have successfully verified your account.",
      });
      // Invalidate user query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP",
        variant: "destructive",
      });
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (e) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return () => {
    authApi.logout();
    queryClient.setQueryData(["user"], null);
    queryClient.clear(); // Clear all cache
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    window.location.href = "/";
  };
}
