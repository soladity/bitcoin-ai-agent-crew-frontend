"use client";

import { useState } from "react";
import { Heading } from "@/components/catalyst/heading";
import { useAgentsList } from "@/hooks/use-agents-list";
import { AgentCard } from "@/components/agents/agent-card";
import { CreateAgentDialog } from "@/components/agents/create-agent-dialog";

export const runtime = 'edge';

export default function AgentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { agents } = useAgentsList();

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Agents</Heading>
        <CreateAgentDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
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
