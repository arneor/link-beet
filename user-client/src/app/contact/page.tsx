import { ContactCard } from "@/components/ui/contact-card";
import { MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { StackedCircularFooter } from "@/components/ui/stacked-circular-footer";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative py-20">
                <div className="absolute top-8 left-8">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                </div>
                <div className="mx-auto max-w-5xl w-full">
                    <ContactCard
                        title="Get in touch"
                        description="If you have any questions regarding our Services or need help, please fill out the form here. We do our best to respond within 1 business day."
                        contactInfo={[
                            {
                                icon: MailIcon,
                                label: 'Email',
                                value: 'contact@linkbeet.com',
                            },
                            {
                                icon: PhoneIcon,
                                label: 'Phone',
                                value: '+1 (555) 123-4567',
                            },
                            {
                                icon: MapPinIcon,
                                label: 'Address',
                                value: 'San Francisco, CA',
                                className: 'col-span-2',
                            }
                        ]}
                        className="border-neutral-200 dark:border-neutral-800"
                    >
                        <form action="" className="w-full space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" type="text" placeholder="Your name" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="your@email.com" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="How can we help you?" />
                            </div>
                            <Button className="w-full" type="button">
                                Submit Message
                            </Button>
                        </form>
                    </ContactCard>
                </div>
            </main>
            <StackedCircularFooter />
        </div>
    );
}
