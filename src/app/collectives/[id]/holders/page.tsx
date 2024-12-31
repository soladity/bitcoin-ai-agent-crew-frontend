"use client";

import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import CollectiveHolders from "@/components/collectives/collective-holders";
import { useCollectiveDetails } from "@/hooks/use-collective-details";

export const runtime = 'edge';

export default function HoldersPage() {
  const params = useParams();
  const id = params.id as string;
  const { holders, tokenSymbol, loading } = useCollectiveDetails(id);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <CollectiveHolders holders={holders} tokenSymbol={tokenSymbol} />
    </div>
  );
}
