'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Performance: 5min staleTime prevents refetch storms on mobile
                        staleTime: 5 * 60 * 1000,
                        // Performance: Keep unused data for 10 minutes before GC
                        gcTime: 10 * 60 * 1000,
                        // Performance: Don't refetch on window focus (mobile tab switching)
                        refetchOnWindowFocus: false,
                        // Retry once on failure (saves bandwidth on mobile)
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
