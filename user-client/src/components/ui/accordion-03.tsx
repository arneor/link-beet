
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const items = [
    {
        id: "01",
        title: "What makes LinkBeet different?",
        img: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=800&q=80",
        content:
            "Unlike basic WiFi portals or standalone link-in-bio tools, LinkBeet combines both into one powerful platform. Your WiFi becomes your digital storefront—branded, engaging, and conversion-focused.",
    },
    {
        id: "02",
        title: "Do I need technical skills?",
        img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
        content:
            "Not at all. Our drag-and-drop builder makes it easy to create beautiful portals in minutes. Add links, upload images, organize your catalog—all without writing a single line of code.",
    },
    {
        id: "03",
        title: "Can I track performance?",
        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        content:
            "Absolutely. See how many customers connect, which links they click, what products they view, and track engagement over time. Make data-driven decisions to grow your business.",
    },
    {
        id: "04",
        title: "What about branding?",
        img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80",
        content:
            "Full customization. Upload your logo, choose your colors, set your fonts, and write your welcome message. Every portal reflects your unique brand identity—no generic templates here.",
    },
    {
        id: "05",
        title: "How do I get started?",
        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        content:
            "Sign up free, create your portal, and connect your WiFi network. Most businesses are up and running in under 15 minutes. Need help? Our support team is always ready to assist.",
    },
];
export function Accordion03() {
    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-primary-foreground text-black">Common Questions</h2>
            <div className="w-full border rounded-lg overflow-hidden">
                <Accordion type="single" defaultValue="02" collapsible className="w-full">
                    {items.map((item) => (
                        <AccordionItem className="relative border-b last:border-0" value={item.id} key={item.id}>
                            <AccordionTrigger className="pl-6 hover:no-underline [&>svg]:hidden text-neutral-800">
                                <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-6 text-neutral-600 w-full md:min-h-[300px] grid md:grid-cols-2 relative bg-neutral-50">
                                <div className="px-6 py-6 space-y-6 flex flex-col justify-center">
                                    <p className="leading-relaxed"> {item.content}</p>
                                    <div>
                                        <Link href="/signup">
                                            <Button
                                            >View More
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="relative h-60 md:h-full w-full border-t md:border-t-0 md:border-l border-neutral-200">
                                    <Image
                                        className="object-cover"
                                        src={item.img}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
