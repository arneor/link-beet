'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        // Debug
        console.log("Dashboard Auto-Redirect - User:", user);

        if (isLoading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        // UNCONDITIONAL REDIRECT
        // Navigate all users to dashboard immediately using businessId (preferred) or userId
        const targetId = user.businessId || user.id;

        if (targetId) {
            router.replace(`/dashboard/${targetId}`);
        } else {
            // Should theoretically never happen for a valid user object
            console.error("Critical: User has no ID");
        }

    }, [user, isLoading, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}
