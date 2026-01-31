import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adsApi, type Ad } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useCampaigns(businessId: string) {
  return useQuery({
    queryKey: ["campaigns", businessId],
    queryFn: async () => {
      if (!businessId) return [];
      try {
        return await adsApi.getByBusiness(businessId);
      } catch {
        return [];
      }
    },
    enabled: !!businessId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      businessId,
      ...data
    }: {
      businessId: string;
      title: string;
      mediaUrl: string;
      mediaType: 'image' | 'video';
      ctaUrl?: string;
      description?: string;
      duration?: number;
    }) => {
      return await adsApi.create(businessId, data);
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific business's campaign list
      queryClient.invalidateQueries({
        queryKey: ["campaigns", variables.businessId],
      });
      toast({ title: "Campaign Created", description: "Your ad is now live." });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create campaign",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      businessId,
      adId,
      ...data
    }: {
      businessId: string;
      adId: string;
    } & Partial<Ad>) => {
      return await adsApi.update(businessId, adId, data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", variables.businessId],
      });
      toast({ title: "Campaign Updated", description: "Changes saved successfully." });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update campaign",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id, // adId
      businessId,
    }: {
      id: string;
      businessId: string;
    }) => {
      return await adsApi.delete(businessId, id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaigns", variables.businessId],
      });
      toast({
        title: "Deleted",
        description: "Campaign removed successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete campaign",
        variant: "destructive",
      });
    },
  });
}

export function useUploadMedia() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      return await adsApi.uploadMedia(file);
    },
    onError: (err: any) => {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to upload media",
        variant: "destructive",
      });
    }
  });
}
