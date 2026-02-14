"use client"
import dynamic from 'next/dynamic'

const ShaderShowcase = dynamic(() => import('@/components/ui/hero'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Shader...</div>
})

export default function LandingPage() {
  return (
    <div className="min-h-screen h-full w-full">
      <ShaderShowcase />
    </div>
  )
}
