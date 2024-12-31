"use client";

import { useParams } from "next/navigation";
import CollectiveOverview from "@/components/collectives/collective-overview";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CollectiveCreationDate } from "@/components/collectives/collective-creation-date";
import { useCollectiveDetails } from "@/hooks/use-collective-details";

export const runtime = "edge";

export default function CollectivePage() {
  const params = useParams();
  const id = params.id as string;
  const {
    collective,
    token,
    loading,
    marketStats,
    treasuryTokens
  } = useCollectiveDetails(id);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!collective) {
    return (
      <div className="text-center">
        <p>Collective not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      <CollectiveOverview 
        collective={collective} 
        token={token} 
        marketStats={marketStats}
        treasuryTokens={treasuryTokens}
      />
      <CollectiveCreationDate createdAt={collective.created_at} />
    </div>
  );
}
