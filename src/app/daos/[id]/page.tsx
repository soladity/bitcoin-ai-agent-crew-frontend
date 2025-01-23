"use client";

import { useParams } from "next/navigation";
import DAOOverview from "@/components/daos/dao-overview";
import { DAOCreationDate } from "@/components/daos/dao-creation-date";
import { useDAODetails } from "@/hooks/use-dao-details";
import { Skeleton } from "@/components/ui/skeleton";

export const runtime = "edge";

export default function DAOPage() {
  const params = useParams();
  const id = params.id as string;
  const { dao, token, loading, marketStats, treasuryTokens } =
    useDAODetails(id);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Loading skeleton for banner */}
        <Skeleton className="h-48 w-full rounded-lg" />

        {/* Loading skeleton for stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>

        {/* Loading skeleton for content */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!dao) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            DAO not found
          </p>
          <p className="text-sm text-muted-foreground/60">
            The DAO you&apos;re looking for doesn&apos;t exist or has been
            removed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <DAOOverview
        dao={dao}
        token={token}
        marketStats={marketStats}
        treasuryTokens={treasuryTokens}
      />
    </div>
  );
}
