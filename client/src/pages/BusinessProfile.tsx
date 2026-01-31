import { useParams } from "wouter";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Wifi, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBusiness, useUpdateBusiness } from "@/hooks/use-businesses";
import type { Business } from "@/lib/api";

// Profile Components
import { EditModeProvider, useEditMode } from "@/components/profile/EditModeContext";
import { EditableProfileHeader } from "@/components/profile/EditableProfileHeader";
import { EditablePostGrid, PostItem } from "@/components/profile/EditablePostGrid";
import { EditableReviewSection } from "@/components/profile/EditableReviewSection";
import { ProfileEditControls } from "@/components/profile/ProfileEditControls";
import { EditableOfferCard, SpecialOffer } from "@/components/profile/EditableOfferCard";

// Inner component that uses EditMode context
interface LocalProfileData {
  businessName: string;
  location: string;
  logoUrl?: string;
  description?: string;
  primaryColor?: string;
}

function BusinessProfileContent() {
  const { id } = useParams();
  const businessId = id || "";
  const { toast } = useToast();

  const { data: business, isLoading, error } = useBusiness(businessId);
  const updateBusiness = useUpdateBusiness();

  const { setHasUnsavedChanges, setIsSaving, isEditMode } = useEditMode();

  // Local state for profile data
  // Mapped to internal component state names (name, address) vs API (businessName, location)
  const [profileData, setProfileData] = useState<LocalProfileData>({
    businessName: "",
    location: "",
  });
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [googlePlaceUrl, setGooglePlaceUrl] = useState("");

  // Special Offer State
  const [specialOffer, setSpecialOffer] = useState<SpecialOffer>({
    title: "Connect & Get 15% Off!",
    description: "Exclusive discount on your first order when you connect",
    isActive: true
  });

  // Load special offer from local storage
  useEffect(() => {
    const savedOffer = localStorage.getItem("mark-morph-special-offer");
    if (savedOffer) {
      try {
        setSpecialOffer(JSON.parse(savedOffer));
      } catch (e) {
        console.error("Failed to parse special offer", e);
      }
    }
  }, []);

  const handleOfferUpdate = (updates: Partial<SpecialOffer>) => {
    const newOffer = { ...specialOffer, ...updates };
    setSpecialOffer(newOffer);
    localStorage.setItem("mark-morph-special-offer", JSON.stringify(newOffer));
    setHasUnsavedChanges(true);
  };

  // Initialize profile data when business loads
  useEffect(() => {
    if (business) {
      setProfileData({
        businessName: business.businessName,
        location: business.location || "",
        logoUrl: business.logoUrl,
        description: business.description,
        primaryColor: business.primaryColor,
      });

      // Initialize Google Review URL from backend
      if (business.googleReviewUrl) {
        setGooglePlaceUrl(business.googleReviewUrl);
      }

      // Parse posts from business data
      const loadedPosts: PostItem[] = [];

      // Banners
      const banners = (business as any).banners || [];
      const photos = (business as any).photos || [];

      if (Array.isArray(banners)) {
        banners.forEach((b: any, idx: number) => {
          loadedPosts.push({
            id: `banner-${idx}`,
            type: "banner",
            url: b.url,
            title: b.title,
            isFeatured: true,
          });
        });
      }

      if (Array.isArray(photos)) {
        photos.forEach((p: any, idx: number) => {
          loadedPosts.push({
            id: `photo-${idx}`,
            type: "image",
            url: p.url,
            title: p.title,
            isFeatured: false,
          });
        });
      }

      setPosts(loadedPosts);
    }
  }, [business]);

  // Merged business data (original + edits)
  const mergedBusiness = useMemo(() => {
    if (!business) return null;
    return {
      ...business,
      ...profileData
    };
  }, [business, profileData]);

  // Handle profile updates
  const handleProfileUpdate = (updates: Partial<LocalProfileData>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
  };

  // Handle save/publish
  const handleSave = async () => {
    if (!business) return;

    setIsSaving(true);

    try {
      // Prepare data for API
      // Remap local fields to API fields
      const updateData = {
        id: businessId,
        businessName: profileData.businessName,
        location: profileData.location,
        description: profileData.description,
        primaryColor: profileData.primaryColor,
        logoUrl: profileData.logoUrl,
        googleReviewUrl: googlePlaceUrl, // Include this in update
        // Convert posts to photos/banners format for API
        photos: posts
          .filter((p) => p.type === "image" && !p.isFeatured)
          .map((p) => ({ url: p.url, title: p.title })),
        banners: posts
          .filter((p) => p.isFeatured)
          .map((p) => ({ url: p.url, title: p.title, type: p.type })),
      };


      await updateBusiness.mutateAsync(updateData as any);

      setHasUnsavedChanges(false);
      toast({
        title: "Profile Published!",
        description: "Your changes are now live.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 animated-gradient opacity-95" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <div className="w-16 h-16 rounded-full gradient-lime-cyan flex items-center justify-center mx-auto mb-4 pulse-glow">
            <Loader2 className="w-8 h-8 animate-spin text-[#222]" />
          </div>
          <div className="text-white font-medium">Loading profile...</div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !mergedBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 animated-gradient opacity-95" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 relative z-10"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-xl font-display font-bold text-white mb-2">
            Profile not found
          </div>
          <div className="text-white/70">
            {error?.message || "Please check the URL and try again."}
          </div>
        </motion.div>
      </div>
    );
  }

  const displayBusiness = mergedBusiness;

  return (
    <div className="min-h-screen flex justify-center relative overflow-hidden">
      {/* Vibrant animated gradient background */}
      <div className="absolute inset-0 animated-gradient opacity-95" />

      {/* Floating decorative blobs */}
      <div
        className="absolute top-10 -left-20 w-64 h-64 blob opacity-30 animate-float"
        style={{ background: "linear-gradient(135deg, #9EE53B, #43E660)" }}
      />
      <div
        className="absolute bottom-40 -right-10 w-80 h-80 blob opacity-25 animate-float-delayed"
        style={{ background: "linear-gradient(135deg, #A855F7, #E639D0)" }}
      />
      <div
        className="absolute top-1/3 right-0 w-48 h-48 blob opacity-20 animate-float-delayed-2"
        style={{ background: "linear-gradient(135deg, #28C5F5, #3CEAC8)" }}
      />

      {/* Mobile container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative z-10">
        {/* Edit Mode Controls */}
        <ProfileEditControls onSave={handleSave} businessId={businessId} />

        {/* Scrollable Content Area */}
        <div
          className={`flex-1 overflow-y-auto ${isEditMode ? "pt-32 pb-28" : "pt-20 pb-8"
            }`}
          style={{ scrollBehavior: "smooth" }}
        >
          {/* Editable Header / Brand Area */}
          <EditableProfileHeader
            business={displayBusiness as any}
            onUpdate={handleProfileUpdate}
          />

          {/* Main Content Area */}
          <div className="px-4 space-y-6 mt-4">
            {/* Featured & Posts Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EditablePostGrid
                posts={posts}
                onPostsChange={(newPosts) => {
                  setPosts(newPosts);
                }}
                maxPosts={10}
              />
            </motion.div>

            {/* Special Offer Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-2 px-1">
                {/* Only show header in edit mode to avoid duplication since card has one */}
                {isEditMode && (
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">
                    Limited Time Offer
                  </h3>
                )}
                <EditableOfferCard
                  offer={specialOffer}
                  onUpdate={handleOfferUpdate}
                  isEditMode={!!isEditMode}
                />
              </div>
            </motion.div>

            {/* Google Reviews Section - Just a link input */}
            <EditableReviewSection
              googlePlaceUrl={googlePlaceUrl}
              onGoogleUrlChange={setGooglePlaceUrl}
            />

            {/* Powered by Footer */}
            <div className="text-center py-4">
              <span className="text-[11px] text-white/40 font-medium">
                Powered by{" "}
                <span className="text-[#9EE53B]/70">MarkMorph</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main exported component with provider
export default function BusinessProfile() {
  return (
    <EditModeProvider>
      <BusinessProfileContent />
    </EditModeProvider>
  );
}
