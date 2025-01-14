"use client";

import { JobsTable } from "@/components/tasks/jobs-table";
import { Heading } from "@/components/ui/heading";
import { useParams } from "next/navigation";

export const runtime = "edge";

export default function AgentJobsPage() {
  const params = useParams();
  const agentId = params.id as string;

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Jobs</Heading>
      </div>

      <div className="mt-6">
        <JobsTable agentId={agentId} />
      </div>
    </div>
  );
}
