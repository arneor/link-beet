'use client';

// Prevent static prerendering for client-only pages
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2,
    Sparkles,
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
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import Link from 'next/link';

export default function LoginPage() {
    const { login, isLoginLoading } = useAuth();

    // Form for login
    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Handle login
    const onSubmit = (data: LoginInput) => {
        login(data);
    };

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

                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-4xl font-display font-black text-[#1A3D1A] mb-3 tracking-tight">Welcome back</h1>
                                <p className="text-[#1A3D1A]/60 font-medium text-lg">Enter your details to sign in.</p>
                            </div>

                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Email</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Email"
                                                        className="h-14 rounded-xl border-2 border-transparent bg-[#F5F1E8] focus:bg-white focus:border-[#D4F935] hover:border-[#D4F935]/50 transition-all font-medium placeholder:text-[#1A3D1A]/30 text-lg px-4"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Password</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="Password"
                                                        className="h-14 rounded-xl border-2 border-transparent bg-[#F5F1E8] focus:bg-white focus:border-[#D4F935] hover:border-[#D4F935]/50 transition-all font-medium placeholder:text-[#1A3D1A]/30 text-lg px-4"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-full bg-[#D4F935] text-[#1A3D1A] font-black text-lg border-2 border-transparent hover:border-black/10 hover:shadow-lg transition-all"
                                        disabled={isLoginLoading}
                                    >
                                        {isLoginLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Logging in...
                                            </>
                                        ) : (
                                            'Log In'
                                        )}
                                    </Button>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-black/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-[#1A3D1A]/40 font-bold tracking-wider">OR</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full h-12 rounded-full border-2 border-black/5 bg-white text-[#1A3D1A] font-bold hover:bg-[#F5F1E8] hover:border-black/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            Continue with Google
                                        </Button>
                                    </div>

                                    <p className="text-center mt-6 text-sm font-bold text-[#1A3D1A]/60">
                                        New to MarkMorph?{' '}
                                        <Link href="/signup" className="text-[#5B1E5E] underline hover:text-[#1A3D1A]">
                                            Create an account
                                        </Link>
                                    </p>
                                </form>
                            </Form>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side - Visuals (Neo-Brutalist Collage) */}
            <div className="hidden lg:flex flex-1 bg-[#1A3D1A] relative overflow-hidden items-center justify-center">
                <NextImage
                    src="/signup-hero.png"
                    alt="Login to MarkMorph"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-[#1A3D1A]/10 mix-blend-multiply" />
            </div>
        </div>
    );
}
