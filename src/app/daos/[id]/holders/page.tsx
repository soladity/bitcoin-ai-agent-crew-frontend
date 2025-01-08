"use client";

import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import DAOHolders from "@/components/daos/dao-holders";
import { useDAODetails } from "@/hooks/use-dao-details";

export const runtime = 'edge';

export default function HoldersPage() {
  const params = useParams();
  const id = params.id as string;
  const { holders, tokenSymbol, loading } = useDAODetails(id);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <DAOHolders holders={holders} tokenSymbol={tokenSymbol} />
    </div>
  );
}
