import { cache } from 'react';
import { fetchBusinessByUsername } from '@/lib/api';
import type { Metadata } from 'next';

/**
 * Performance: React cache() deduplicates this fetch across
 * generateMetadata() and the page component (single API call per render)
 */
const getBusinessByUsername = cache((username: string) =>
    fetchBusinessByUsername(username)
);

interface CatalogPageProps {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Performance: Dynamic metadata for SEO + social sharing
 * Generates unique title, description, and OG images per business profile
 * Also handles specific catalog item metadata if ?item=ID is present
 */
export async function generateMetadata({ params, searchParams }: CatalogPageProps): Promise<Metadata> {
    const { username } = await params;
    const query = await searchParams;
    const itemId = query?.item as string | undefined;

    try {
        const business = await getBusinessByUsername(username);
        if (!business) return { title: 'Profile Not Found' };

        const sectionTitle = business.sectionTitle || 'Our Menu';

        let title = `${sectionTitle} | ${business.businessName}`;
        let description = `Explore the ${sectionTitle} at ${business.businessName}. ${business.tagline || ''}`;
        let image = business.profileImage || business.logoUrl || '';
        const validImage = (url: string | null | undefined): url is string => !!url && url.length > 0;

        if (itemId && business.catalogItems) {
            const catalogItem = business.catalogItems.find(i => i.id === itemId);
            if (catalogItem) {
                title = `${catalogItem.title} | ${business.businessName}`;
                description = catalogItem.description || `Check out ${catalogItem.title} at ${business.businessName}.`;
                if (catalogItem.imageUrl) {
                    image = catalogItem.imageUrl;
                }
            }
        }

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: validImage(image) ? [{ url: image }] : undefined,
                type: itemId ? 'article' : 'website', // Use article or product for items
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: validImage(image) ? [image] : undefined,
            },
        };
    } catch {
        return { title: 'Catalog | LinkBeet' };
    }
}

export default function CatalogPage() {
    /* 
     * Rendering is delegated to [username]/layout.tsx which maintains the shell (TreeProfileView).
     * TreeProfileView handles tab switching client-side based on URL segment.
     * This component exists solely for Route Resolution and Metadata.
     */
    return null;
}
