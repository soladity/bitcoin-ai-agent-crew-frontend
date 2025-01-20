import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import DAOProposals from "@/components/daos/dao-proposals";
import { supabase } from "@/utils/supabase/client";

export const runtime = "edge";

async function getProposals(daoId: string) {
  const { data: proposals, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("dao_id", daoId);

  if (error) throw error;
  return proposals;
}

export default async function ProposalsPage({
  params,
}: {
  params: { id: string };
}) {
  const proposals = await getProposals(params.id);

  return (
    <div className="w-full px-4 sm:px-0">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[200px] w-full">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <DAOProposals proposals={proposals} />
      </Suspense>
    </div>
  );
}
