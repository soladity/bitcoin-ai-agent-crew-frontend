"use client";

import { useParams } from "next/navigation";
import DAOOverview from "@/components/daos/dao-overview";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DAOCreationDate } from "@/components/daos/dao-creation-date";
import { useDAODetails } from "@/hooks/use-dao-details";

export const runtime = "edge";

export default function DAOPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    dao,
    token,
    loading,
    marketStats,
    treasuryTokens
  } = useDAODetails(id);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!dao) {
    return (
      <div className="text-center">
        <p>DAO not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      <DAOOverview 
        dao={dao} 
        token={token} 
        marketStats={marketStats}
        treasuryTokens={treasuryTokens}
      />
      <DAOCreationDate createdAt={dao.created_at} />
    </div>
  );
}
