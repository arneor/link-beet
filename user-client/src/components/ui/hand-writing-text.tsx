"use client";

import { motion } from "framer-motion";
import React from "react";

interface HandWrittenTitleProps {
    title?: string;
    subtitle?: string;
}

function HandWrittenTitle({
    title = "Hand Written",
    subtitle = "Optional subtitle",
}: HandWrittenTitleProps) {
    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { duration: 2.5, ease: "easeInOut" as const },
            },
        },
    };

    return (
        <div className="min-h-[40vh] md:min-h-screen relative w-full max-w-4xl mx-auto py-20 md:py-24 flex flex-col items-center justify-center">
            {/* Desktop SVG */}
            <div className="absolute inset-0 hidden md:block">
                <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1200 600"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="w-full h-full"
                >
                    <title>{title}</title>
                    <motion.path
                        d="M 950 90 
                           C 1250 300, 1050 480, 600 520
                           C 250 520, 150 480, 150 300
                           C 150 120, 350 80, 600 80
                           C 850 80, 950 180, 950 180"
                        fill="none"
                        strokeWidth="12"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="text-black opacity-90"
                    />
                </motion.svg>
            </div>

            {/* Mobile SVG - Optimized as a wide oval for text */}
            <div className="absolute inset-0 block md:hidden pointer-events-none">
                <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 220"
                    preserveAspectRatio="none"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="w-full h-full"
                >
                    <title>{title}</title>
                    <motion.path
                        /* Wider and taller oval to encompass wrapped text */
                        d="M 350 30
                           C 390 50, 395 150, 350 180
                           C 280 215, 120 215, 50 180
                           C 5 150, 10 50, 50 30
                           C 120 5, 280 5, 350 30"
                        fill="none"
                        strokeWidth="5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="text-black opacity-90"
                    />
                </motion.svg>
            </div>

            <div className="relative text-center z-10 flex flex-col items-center justify-center px-4">
                <motion.h1
                    className="text-3xl md:text-6xl text-black tracking-tighter flex items-center gap-2 font-bold mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    {title}
                </motion.h1>
                {subtitle && (
                    <motion.p
                        className="text-base md:text-xl text-black/80 max-w-[260px] md:max-w-xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
        </div>
    );
}

export { HandWrittenTitle };
