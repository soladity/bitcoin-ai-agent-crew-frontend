"use client";

import { useAgentDetails } from "@/hooks/use-agent-details";
import { AgentProfileCard } from "@/components/agents/agent-profile-card";
import { AgentDetailsCard } from "@/components/agents/agent-details-card";
import { Loader } from "@/components/reusables/loader";

export const runtime = 'edge';

export default function AgentDetailPage() {
  const { agent, loading } = useAgentDetails();

  if (loading) {
    return <Loader />;
  }

  if (!agent) {
    return <div className="container mx-auto py-8">Agent not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AgentProfileCard agent={agent} />
        </div>

        <div className="lg:col-span-2">
          <AgentDetailsCard agent={agent} />
        </div>
      </div>
    </div>
  );
}
