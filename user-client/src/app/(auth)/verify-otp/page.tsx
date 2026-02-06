'use client';

// Prevent static prerendering for client-only pages
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    Loader2,
    CheckCircle2,
    ArrowLeft,
    Sparkles,
} from 'lucide-react';
import NextImage from 'next/image';
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
import { useAuth } from '@/hooks/use-auth';
import { otpSchema, type OTPInput } from '@/lib/validations/auth';
import Link from 'next/link';

export default function VerifyOTPPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const { verifyOTP, resendOTP, isVerifyingOTP, isResendingOTP } = useAuth();

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            router.push('/signup');
        }
    }, [email, router]);

    // Form for OTP
    const otpForm = useForm<OTPInput>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: '',
        },
    });

    // Handle OTP submit
    const onSubmit = (data: OTPInput) => {
        if (!email) return;
        verifyOTP({ email, otp: data.otp });
    };

    // Handle resend OTP
    const handleResendOTP = () => {
        if (!email) return;
        resendOTP(email);
    };

    if (!email) {
        return null;
    }

    return (
        <div className="min-h-screen w-full flex bg-[#F5F1E8]">
            {/* Left Side - Form Section */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[600px] bg-white border-r-2 border-black/10 relative z-10">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-[#D4F935] rounded-xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-px group-hover:translate-y-px transition-all">
                                <Sparkles className="w-5 h-5 text-[#1A3D1A]" />
                            </div>
                            <span className="text-2xl font-display font-black text-[#1A3D1A]">
                                Mark<span className="text-[#5B1E5E]">Morph</span>
                            </span>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/signup')}
                            className="mb-8 pl-0 hover:bg-transparent text-[#1A3D1A]/60 hover:text-[#1A3D1A] font-bold self-start"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </Button>

                        <div className="w-24 h-24 bg-[#D4F935] rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12 text-[#1A3D1A]" />
                        </div>

                        <h2 className="text-3xl font-display font-black text-[#1A3D1A] mb-3 text-center">Verify Email</h2>
                        <p className="text-[#1A3D1A]/60 font-medium text-lg leading-relaxed mb-8 text-center">
                            Enter the 6-digit code sent to <br />
                            <span className="text-[#1A3D1A] font-bold">{email}</span>
                        </p>

                        <Form {...otpForm}>
                            <form onSubmit={otpForm.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={otpForm.control}
                                    name="otp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">OTP Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123456"
                                                    maxLength={6}
                                                    className="h-14 rounded-xl border-2 border-transparent bg-[#F5F1E8] focus:bg-white focus:border-[#D4F935] hover:border-[#D4F935]/50 transition-all font-medium placeholder:text-[#1A3D1A]/30 text-lg px-4 text-center tracking-widest"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="font-bold text-center" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-14 rounded-full bg-[#D4F935] text-[#1A3D1A] font-black text-lg border-2 border-transparent hover:border-black/10 hover:shadow-lg transition-all"
                                    disabled={isVerifyingOTP}
                                >
                                    {isVerifyingOTP ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </Button>

                                <div className="text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleResendOTP}
                                        disabled={isResendingOTP}
                                        className="text-[#5B1E5E] hover:text-[#1A3D1A] font-bold hover:bg-transparent"
                                    >
                                        {isResendingOTP ? 'Sending...' : "Didn't receive the code? Resend"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Visuals */}
            <div className="hidden lg:flex flex-1 bg-[#1A3D1A] relative overflow-hidden items-center justify-center">
                <NextImage
                    src="/signup-hero.png"
                    alt="Verify your email"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-[#1A3D1A]/10 mix-blend-multiply" />
            </div>
        </div>
    );
}
