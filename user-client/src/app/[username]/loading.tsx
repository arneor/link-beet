/**
 * Performance: Streaming loading state for public profile pages
 * This enables Next.js Suspense boundaries + streaming SSR,
 * showing an instant skeleton while the server fetches business data.
 * Reduces perceived load time significantly on mobile (FCP < 1s).
 */
import { TreeProfileSkeleton } from '@/components/tree-profile/TreeProfileSkeleton';

export default function Loading() {
    return <TreeProfileSkeleton />;
}
