"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAgentDetails } from "@/hooks/use-agent-details";
import { AgentProfileCard } from "@/components/agents/agent-profile-card";
import { AgentDetailsCard } from "@/components/agents/agent-details-card";

export const runtime = 'edge';

export default function AgentDetailPage() {
  const { agent, loading } = useAgentDetails();

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!agent) {
    return <div className="container mx-auto py-8">Agent not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/agents">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </Link>
      </div>

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
