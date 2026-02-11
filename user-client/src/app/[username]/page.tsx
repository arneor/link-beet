import { TreeProfileView } from '@/components/tree-profile/TreeProfileView';

// Dummy Data (fallback for missing fields)
import { dummyTreeProfileData } from '@/lib/dummyTreeProfileData';

export default function PublicProfilePage() {
    // We are using dummy data directly for now, no need for loading state or effects
    // This makes the page load instantly and avoids React warnings

    return (
        <TreeProfileView
            data={dummyTreeProfileData}
            isEditMode={false}
        />
    );
}
