'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function OnboardingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D4F935]/30 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#E8B4E3]/30 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 bg-[#D4F935] rounded-xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-px group-hover:translate-y-px transition-all">
                            <Sparkles className="w-5 h-5 text-[#1A3D1A]" />
                        </div>
                        <span className="text-2xl font-display font-black text-[#1A3D1A]">
                            Mark<span className="text-[#5B1E5E]">Morph</span>
                        </span>
                    </Link>

                    {/* Progress Indicator (Optional, can be added here if needed across steps) */}
                </div>

                {children}
            </div>
        </div>
    );
}
