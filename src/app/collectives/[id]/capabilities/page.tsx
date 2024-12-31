"use client";

import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import CollectiveCapabilities from "@/components/collectives/collective-capabilities";
import { useCollectiveDetails } from "@/hooks/use-collective-details";

export const runtime = 'edge';

export default function CapabilitiesPage() {
  const params = useParams();
  const id = params.id as string;
  const { collectiveCapabilities, loading } = useCollectiveDetails(id);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {collectiveCapabilities && collectiveCapabilities.length > 0 && (
        <CollectiveCapabilities capabilities={collectiveCapabilities} />
      )}
    </div>
  );
}
