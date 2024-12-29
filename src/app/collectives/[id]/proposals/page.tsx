import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CollectiveProposals from "@/components/collectives/CollectiveProposals";
import { supabase } from "@/utils/supabase/client";

export const runtime = 'edge';

async function getProposals(collectiveId: string) {
  const { data: proposals, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("collective_id", collectiveId);

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
    <Suspense fallback={<Loader2 className="h-4 w-4 animate-spin" />}>
      <CollectiveProposals proposals={proposals} />
    </Suspense>
  );
}