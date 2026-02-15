"use client"

import React from "react"
import { cn } from "@/lib/utils"
// Utilizing the PlusIcon from lucide-react for consistency with the existing design system
import { Plus } from "lucide-react"

const cardContents = [
    {
        title: "Branded WiFi Portals",
        description:
            "Transform WiFi login into a branded experience. Welcome customers with your logo, colors, and message the moment they connect.",
    },
    {
        title: "Centralized Link Tree",
        description:
            "Share all your important links in one elegant hub. Social profiles, booking pages, menus, promotions everything customers need, instantly accessible.",
    },
    {
        title: "Product Showcases",
        description:
            "Display your catalog directly through your WiFi portal. Let customers browse products, services, or menu items without leaving the connection page.",
    },
    {
        title: "Image Galleries",
        description:
            "Tell your visual story. Share photos of your space, products, events, or team to engage customers and build your brand presence.",
    },
    {
        title: "All-in-One Solution",
        description:
            "Built for modern businesses cafes, restaurants, hotels, retail stores. One platform that combines WiFi access with complete digital engagement.",
    },
]

const PlusCard: React.FC<{
    className?: string
    title: string
    description: string
}> = ({
    className = "",
    title,
    description,
}) => {
        return (
            <div
                className={cn(
                    "relative border border-dashed border-zinc-400 rounded-lg p-6 bg-white min-h-[200px]",
                    "flex flex-col justify-between",
                    className
                )}
            >
                <CornerPlusIcons />
                {/* Content */}
                <div className="relative z-10 space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                        {title}
                    </h3>
                    <p className="text-gray-700">{description}</p>
                </div>
            </div>
        )
    }

const CornerPlusIcons = () => (
    <>
        <div className="absolute -top-3 -left-3">
            <Plus className="w-6 h-6 text-black" strokeWidth={1} />
        </div>
        <div className="absolute -top-3 -right-3">
            <Plus className="w-6 h-6 text-black" strokeWidth={1} />
        </div>
        <div className="absolute -bottom-3 -left-3">
            <Plus className="w-6 h-6 text-black" strokeWidth={1} />
        </div>
        <div className="absolute -bottom-3 -right-3">
            <Plus className="w-6 h-6 text-black" strokeWidth={1} />
        </div>
    </>
)

export default function FeaturesSection() {
    return (
        <section className="bg-white w-full border-t border-gray-200">
            <div className="container mx-auto py-24 border-x border-gray-200 px-4">
                {/* Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 auto-rows-auto gap-8">
                    <PlusCard {...cardContents[0]} className="lg:col-span-3 lg:row-span-2 min-h-[300px]" />
                    <PlusCard {...cardContents[1]} className="lg:col-span-2 lg:row-span-2 min-h-[300px]" />
                    <PlusCard {...cardContents[2]} className="lg:col-span-4 lg:row-span-1" />
                    <PlusCard {...cardContents[3]} className="lg:col-span-2 lg:row-span-1" />
                    <PlusCard {...cardContents[4]} className="lg:col-span-2 lg:row-span-1" />
                </div>

                {/* Section Footer Heading */}
                <div className="max-w-2xl ml-auto text-right px-4 mt-20">
                    <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
                        One connection. Endless engagement.
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        LinkBeet transforms your WiFi into a complete digital experience. Combine branded portals, link collections, product catalogs, and galleries—all in one seamless platform that turns every customer connection into an opportunity.
                    </p>
                </div>
            </div>
        </section>
    )
}
