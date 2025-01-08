"use client";

import { useParams } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import DAOExtensions from "@/components/daos/dao-extensions";
import { useDAODetails } from "@/hooks/use-dao-details";

export const runtime = 'edge';

export default function ExtensionsPage() {
  const params = useParams();
  const id = params.id as string;
  const { daoExtensions, loading } = useDAODetails(id);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {daoExtensions && daoExtensions.length > 0 && (
        <DAOExtensions extensions={daoExtensions} />
      )}
    </div>
  );
}
