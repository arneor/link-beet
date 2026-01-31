import { useQuery, useMutation } from "@tanstack/react-query";
import { businessApi, analyticsApi } from "@/lib/api";

export function useSplashData(businessId: string) {
  return useQuery({
    queryKey: ["splash", businessId],
    queryFn: async () => {
      // Logic: if businessId is "1" or similar numeric (old demo ID), we might want to still attempt?
      // But now we are strictly moving to backend.
      try {
        return await businessApi.getSplashData(businessId);
      } catch (err: any) {
        if (err.statusCode === 404) throw new Error("Business not found");
        throw err;
      }
    },
    // Don't retry if business is not found
    retry: (failureCount, error) => {
      if (error.message === "Business not found") return false;
      return failureCount < 2;
    },
    enabled: !!businessId,
  });
}

export function useConnectWifi() {
  return useMutation({
    mutationFn: async ({
      businessId,
      ...data
    }: {
      businessId: string;
      email?: string;
      deviceType?: string;
    }) => {
      // Simulate network delay for realistic "connecting" feel
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        return await analyticsApi.connectWifi({
          businessId,
          ...data
        });
      } catch {
        // Fallback for demo or offline
        return { success: true, redirectUrl: "https://google.com" };
      }
    },
  });
}

export function useTrackInteraction() {
  return useMutation({
    mutationFn: async (data: {
      adId: string;
      businessId: string;
      interactionType: "view" | "click";
    }) => {
      return await analyticsApi.trackInteraction(data);
    }
  });
}
