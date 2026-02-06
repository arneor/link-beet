'use client';

// Prevent static prerendering for client-only pages
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Loader2,
    Store,
    Camera,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/use-onboarding';
import type { CategorySelection } from '@/types/onboarding';

export default function CategoryPage() {
    const { saveCategory, isSavingCategory } = useOnboarding();
    const [selectedCategory, setSelectedCategory] = useState<CategorySelection['category'] | null>(null);

    const handleContinue = () => {
        if (!selectedCategory) return;
        saveCategory({ category: selectedCategory });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="text-center mb-8">
                <h1 className="text-4xl font-display font-black text-[#1A3D1A] mb-3">What's your vibe?</h1>
                <p className="text-[#1A3D1A]/70 font-medium text-lg">Tell us how you'll use MarkMorph.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Creator Option */}
                <div
                    onClick={() => setSelectedCategory('creator')}
                    className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all ${selectedCategory === 'creator'
                        ? 'bg-[#E8B4E3] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                        : 'bg-white border-black hover:bg-[#F5F1E8] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                >
                    {selectedCategory === 'creator' && (
                        <div className="absolute top-4 right-4">
                            <CheckCircle2 className="w-6 h-6 text-[#1A3D1A]" />
                        </div>
                    )}
                    <div className="w-14 h-14 bg-white rounded-2xl border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <Camera className="w-7 h-7 text-[#1A3D1A]" />
                    </div>
                    <h3 className="text-xl font-display font-black text-[#1A3D1A] mb-2">Creator</h3>
                    <p className="text-sm text-[#1A3D1A]/80 font-medium leading-relaxed">
                        For content machines, artists, and personal brands.
                    </p>
                </div>

                {/* Business Option */}
                <div
                    onClick={() => setSelectedCategory('business')}
                    className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all ${selectedCategory === 'business'
                        ? 'bg-[#D4F935] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                        : 'bg-white border-black hover:bg-[#F5F1E8] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                >
                    {selectedCategory === 'business' && (
                        <div className="absolute top-4 right-4">
                            <CheckCircle2 className="w-6 h-6 text-[#1A3D1A]" />
                        </div>
                    )}
                    <div className="w-14 h-14 bg-white rounded-2xl border-2 border-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        <Store className="w-7 h-7 text-[#1A3D1A]" />
                    </div>
                    <h3 className="text-xl font-display font-black text-[#1A3D1A] mb-2">Business</h3>
                    <p className="text-sm text-[#1A3D1A]/80 font-medium leading-relaxed">
                        For brands, shops, agencies, and reliable pros.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleContinue}
                className="w-full h-14 rounded-xl bg-[#3B5BFE] text-white font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                disabled={isSavingCategory || !selectedCategory}
            >
                {isSavingCategory ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </Button>
        </motion.div>
    );
}
