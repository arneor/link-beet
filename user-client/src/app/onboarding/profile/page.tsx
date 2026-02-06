'use client';

// Prevent static prerendering for client-only pages
export const dynamic = 'force-dynamic';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Loader2,
    MapPin,
    User,
    Store,
    AlignLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuthStore } from '@/stores/auth-store';
import { creatorProfileSchema, businessProfileSchema } from '@/lib/validations/onboarding';
import type { ProfileData } from '@/types/onboarding';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function ProfilePage() {
    const { saveProfile, isSavingProfile } = useOnboarding();
    const { user } = useAuthStore();
    const { category } = useOnboardingStore();

    const isBusinessCategory = category === 'business';

    // Use appropriate schema based on category
    const schema = isBusinessCategory ? businessProfileSchema : creatorProfileSchema;

    const form = useForm<ProfileData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            displayName: user?.displayName || '',
            businessName: user?.displayName || user?.username || '',
            businessType: '',
            location: '',
            bio: '',
            creatorType: '',
        },
    });

    // Check for existing profile data (optional: fetch full profile if needed)
    // For now, relies on auth user data to pre-fill basics

    const onSubmit = (data: ProfileData) => {
        saveProfile(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 sm:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-black text-[#1A3D1A] mb-2">Almost there!</h1>
                    <p className="text-[#1A3D1A]/70 font-medium">Tell us a bit about {isBusinessCategory ? 'your business' : 'yourself'}</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Business Name or Display Name */}
                        {isBusinessCategory ? (
                            <FormField
                                control={form.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-[#1A3D1A]">Business Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A3D1A]/40" />
                                                <Input
                                                    placeholder="e.g. The Coffee House"
                                                    className="pl-10 h-12 rounded-xl border-2 border-black bg-[#F5F1E8] focus:ring-0 focus:border-[#5B1E5E] transition-colors font-medium placeholder:text-[#1A3D1A]/30"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-[#1A3D1A]">Display Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A3D1A]/40" />
                                                <Input
                                                    placeholder="e.g. John Doe"
                                                    className="pl-10 h-12 rounded-xl border-2 border-black bg-[#F5F1E8] focus:ring-0 focus:border-[#5B1E5E] transition-colors font-medium placeholder:text-[#1A3D1A]/30"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Business Type (only for business) */}
                        {isBusinessCategory && (
                            <FormField
                                control={form.control}
                                name="businessType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-[#1A3D1A]">Business Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl border-2 border-black bg-[#F5F1E8] focus:ring-0 focus:border-[#5B1E5E] transition-colors font-medium">
                                                    <SelectValue placeholder="Select business type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <SelectItem value="RESTAURANT_CAFE">Restaurant / Cafe</SelectItem>
                                                <SelectItem value="RETAIL_STORE">Retail Store</SelectItem>
                                                <SelectItem value="SALON_SPA">Salon / Spa</SelectItem>
                                                <SelectItem value="GYM_FITNESS">Gym / Fitness</SelectItem>
                                                <SelectItem value="HOTEL_HOSTEL">Hotel / Hostel</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Creator Type (only for creator) */}
                        {!isBusinessCategory && (
                            <FormField
                                control={form.control}
                                name="creatorType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-[#1A3D1A]">Creator Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-12 rounded-xl border-2 border-black bg-[#F5F1E8] focus:ring-0 focus:border-[#5B1E5E] transition-colors font-medium">
                                                    <SelectValue placeholder="Select creator type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <SelectItem value="Content Creator">Content Creator</SelectItem>
                                                <SelectItem value="Artist / Designer">Artist / Designer</SelectItem>
                                                <SelectItem value="Photographer / Videographer">Photographer / Videographer</SelectItem>
                                                <SelectItem value="Influencer">Influencer</SelectItem>
                                                <SelectItem value="Writer / Journalist">Writer / Journalist</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Location */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-[#1A3D1A]">
                                        Location {!isBusinessCategory && <span className="text-[#1A3D1A]/40 font-normal">(Optional)</span>}
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A3D1A]/40" />
                                            <Input
                                                placeholder="e.g. Mumbai, India"
                                                className="pl-10 h-12 rounded-xl border-2 border-black bg-[#F5F1E8] focus:ring-0 focus:border-[#5B1E5E] transition-colors font-medium placeholder:text-[#1A3D1A]/30"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        {/* Bio / Description */}
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-[#1A3D1A]">
                                        Short Bio <span className="text-[#1A3D1A]/40 font-normal">(Optional)</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <AlignLeft className="absolute left-3 top-4 w-5 h-5 text-[#1A3D1A]/40" />
                                            <Textarea
                                                placeholder="Tell your story in a few words..."
                                                className="pl-10 min-h-[100px] rounded-xl border-2 border-black bg-[#F5F1E8] focus:ring-0 focus:border-[#5B1E5E] transition-colors font-medium placeholder:text-[#1A3D1A]/30 resize-none pt-4"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="font-bold" />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl bg-[#D4F935] text-[#1A3D1A] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            disabled={isSavingProfile}
                        >
                            {isSavingProfile ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Continue to Username
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </motion.div>
    );
}
