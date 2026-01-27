import { useMutation } from "@tanstack/react-query";
import { api, type LoginRequest, type SignupRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useLogin() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username");
        throw new Error("Login failed");
      }

      return api.auth.login.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: `Welcome back, ${data.username}!`,
        description: "You have successfully logged in.",
      });
    },
  });
}

export function useSignup() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: SignupRequest) => {
      const res = await fetch(api.auth.signup.path, {
        method: api.auth.signup.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const message = "Signup failed";
        throw new Error(message);
      }

      return api.auth.signup.responses[201].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: `Welcome, ${data.username}!`,
        description: "Your business account has been created.",
      });
    },
  });
}
