'use client';

// Prevent static prerendering for client-only pages
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Loader2,
    CheckCircle2,
    XCircle,
    AtSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useOnboarding, useUsernameAvailability } from '@/hooks/use-onboarding';
import { usernameSchema, type UsernameInput } from '@/lib/validations/onboarding';

export default function UsernamePage() {
    const { saveUsername, isSavingUsername } = useOnboarding();

    const form = useForm<UsernameInput>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: '',
        },
    });

    const username = form.watch('username');

    // Debounce username for availability check
    const [debouncedUsername, setDebouncedUsername] = useState(username);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUsername(username);
        }, 500);
        return () => clearTimeout(timer);
    }, [username]);

    // Real-time availability check
    const { data: availabilityData, isLoading: isChecking } = useUsernameAvailability(debouncedUsername);

    const onSubmit = (data: UsernameInput) => {
        if (availabilityData?.isAvailable === false) return;
        saveUsername(data);
    };

    // Show availability indicator
    const showAvailabilityIndicator = debouncedUsername && debouncedUsername.length >= 3;
    const isAvailable = availabilityData?.isAvailable === true;
    const isTaken = availabilityData?.isAvailable === false;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-6 sm:p-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display font-black text-[#1A3D1A] mb-3">Claim your unique link</h1>
                    <p className="text-[#1A3D1A]/70 font-medium text-lg">This is the start of something big. Choose wisely.</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold text-[#1A3D1A] text-lg">Username</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[#1A3D1A]/50 font-bold text-lg pointer-events-none">
                                                <AtSign className="w-5 h-5" />
                                                <span>markmorph.in/</span>
                                            </div>
                                            <Input
                                                placeholder="yourname"
                                                className={`pl-[180px] h-14 rounded-xl border-2 bg-[#F5F1E8] focus:ring-0 transition-all font-bold text-lg placeholder:text-[#1A3D1A]/20 ${isAvailable
                                                    ? 'border-[#D4F935] focus:border-[#D4F935]'
                                                    : isTaken
                                                        ? 'border-red-500 focus:border-red-500'
                                                        : 'border-black focus:border-[#5B1E5E]'
                                                    }`}
                                                {...field}
                                                autoComplete="off"
                                                autoCapitalize="none"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                {showAvailabilityIndicator && (
                                                    <>
                                                        {isChecking ? (
                                                            <Loader2 className="w-5 h-5 animate-spin text-[#1A3D1A]/50" />
                                                        ) : isAvailable ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        ) : isTaken ? (
                                                            <XCircle className="w-5 h-5 text-red-500" />
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <div className="min-h-[20px]">
                                        {showAvailabilityIndicator && (
                                            <>
                                                {isTaken && (
                                                    <p className="text-sm font-bold text-red-500 flex items-center gap-1 mt-1">
                                                        <XCircle className="w-3 h-3" />
                                                        Username is taken
                                                    </p>
                                                )}
                                                {isAvailable && (
                                                    <p className="text-sm font-bold text-green-600 flex items-center gap-1 mt-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Available!
                                                    </p>
                                                )}
                                            </>
                                        )}
                                        <FormMessage className="font-bold" />
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-14 rounded-xl bg-[#D4F935] text-[#1A3D1A] font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            disabled={isSavingUsername || isChecking || !isAvailable}
                        >
                            {isSavingUsername ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Claiming...
                                </>
                            ) : (
                                <>
                                    Claim & Finish
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
