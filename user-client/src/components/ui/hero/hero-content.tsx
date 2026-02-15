"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"

export function HeroContent() {
    const router = useRouter()
    const isMobile = useIsMobile()

    return (
        <main className="absolute bottom-8 left-8 z-50 max-w-2xl">
            <div className="text-left">
                <motion.div
                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
                    style={{
                        backdropFilter: "blur(12px)",
                        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="absolute top-0 left-1 right-1 h-px bg-linear-to-r from-transparent via-cyan-400/30 to-transparent rounded-full" />
                    <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
                        ✨ Beyond WiFi Connection
                    </span>
                </motion.div>

                <motion.h1
                    className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <motion.span
                        className="block font-light text-4xl md:text-5xl lg:text-6xl mb-2 tracking-wider drop-shadow-2xl"
                        style={{
                            background: "linear-gradient(135deg, #ffffff 0%, #06b6d4 30%, #3b82f6 70%, #ffffff 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            textShadow: "0 0 20px rgba(6,182,212,0.5)",
                        }}
                        animate={isMobile ? {} : {
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    >
                        Transform
                    </motion.span>
                    <span className="block font-bold text-white drop-shadow-2xl">
                        Every
                    </span>
                    <span className="block font-light text-white/80 italic">
                        Connection
                    </span>
                </motion.h1>

                <motion.p
                    className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    Turn WiFi access into your complete digital presence. Create branded portals with catalogs, link collections, and galleries that engage customers the moment they connect. One touchpoint, endless possibilities.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                >
                    <Link href="/#features">
                        <motion.button
                            className="px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-100 cursor-pointer backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            View Features
                        </motion.button>
                    </Link>
                    <motion.button
                        onClick={() => router.push("/signup")}
                        className="px-10 py-4 rounded-full bg-linear-to-r from-cyan-500 to-orange-500 text-white font-semibold text-sm transition-all duration-300 hover:from-cyan-400 hover:to-orange-400 cursor-pointer shadow-lg hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                    </motion.button>
                </motion.div>
            </div>
        </main>
    )
}
