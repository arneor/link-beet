"use client"
import dynamic from 'next/dynamic'

const ShaderShowcase = dynamic(() => import('@/components/ui/hero'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Shader...</div>
})

import FeaturesSection from '@/components/ui/features-section';
import { StackedCircularFooter } from '@/components/ui/stacked-circular-footer';
import { HowItWorksSection } from '@/components/ui/how-it-work';
import { HandWrittenTitle } from '@/components/ui/hand-writing-text';
import { Accordion03 } from '@/components/ui/accordion-03';
import { CTASection } from '@/components/ui/cta-section';

export default function LandingPage() {
  return (
    <div className="min-h-screen h-full w-full">
      <ShaderShowcase />
      <section id="features" className="scroll-mt-20">
        <FeaturesSection />
      </section>
      <section id="how-it-works" className="scroll-mt-20">
        <HandWrittenTitle title="Beyond Connection" subtitle="How LinkBeet turns WiFi into opportunity" />
        <HowItWorksSection />
      </section>
      <section id="faq" className="scroll-mt-20">
        <Accordion03 />
      </section>
      <CTASection />
      <StackedCircularFooter />
    </div>
  )
}
