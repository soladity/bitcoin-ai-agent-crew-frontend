"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Heading } from "@/components/catalyst/heading";
import { useAgentsList } from "@/hooks/use-agents-list";
import { AgentCard } from "@/components/agents/agent-card";

export const runtime = 'edge';

export default function AgentsPage() {
  const { agents } = useAgentsList();

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Agents</Heading>
        <Link href="/agents/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Agent
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}
