import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
    return (
        <section className="relative py-24 overflow-hidden bg-background">
            {/* Background Gradients/Blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-10 opacity-50" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-3xl -z-10 opacity-30" />

            <div className="container px-4 md:px-6 mx-auto">
                <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-white/5 backdrop-blur-sm shadow-2xl">
                    {/* Inner Gradient Border Effect */}
                    <div className="absolute inset-0 bg-linear-to-br from-white/40 to-white/0 pointer-events-none" />

                    <div className="relative z-10 px-6 py-16 md:py-20 lg:px-12 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-foreground text-sm font-medium animate-element">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--primary))] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--primary))]"></span>
                            </span>
                            Get Started Today
                        </div>

                        {/* Heading */}
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-display animate-element animate-delay-100">
                            <span className="block text-foreground">Ready to Transform</span>
                            <span className="block mt-1 text-foreground">
                                Your Digital Presence?
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-element animate-delay-200">
                            Join thousands of businesses using LinkBeet to turn simple WiFi connections into powerful customer engagement channels.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-element animate-delay-300">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8 py-6 text-base font-medium bg-transparent border-2 border-black border-dotted text-black hover:bg-black hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <Link href="/signup">
                                    Start Your Journey
                                    <ArrowRight className="ml-2 h-5 w-5 text-current" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
