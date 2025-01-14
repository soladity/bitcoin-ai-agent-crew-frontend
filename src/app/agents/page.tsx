"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { useAgentsList } from "@/hooks/use-agents-list";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const runtime = "edge";

export default function AgentsPage() {
  const { agents } = useAgentsList();
  const [showArchived, setShowArchived] = useState(false);

  const activeAgents = agents.filter((agent) => !agent.is_archived);
  const archivedAgents = agents.filter((agent) => agent.is_archived);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 pb-8">
        <div>
          <Heading>Agent Store</Heading>
          <p className="text-muted-foreground mt-1">
            Discover and deploy AI agents for your needs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className={cn("gap-2", showArchived && "bg-zinc-800/50")}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Link href="/agents/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeAgents.map((agent) => (
          <Link
            href={`/agents/${agent.id}`}
            key={agent.id}
            className="group flex items-center p-4 bg-card hover:bg-muted transition-colors duration-200 rounded-lg"
          >
            <div
              className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden"
              style={{
                backgroundImage: `url(${
                  agent.image_url || "/placeholder-agent.png"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {agent.name ? agent.name.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
            </div>
            <div className="ml-4 flex-grow">
              <h3 className="font-medium text-base">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {agent.goal || agent.role}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Archived Agents */}
      {showArchived && archivedAgents.length > 0 && (
        <div className="mt-12">
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="text-lg font-medium text-muted-foreground">
              Archived Agents
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedAgents.map((agent) => (
              <Link
                href={`/agents/${agent.id}`}
                key={agent.id}
                className="group flex items-center p-4 bg-card hover:bg-muted transition-colors duration-200 rounded-lg opacity-75 hover:opacity-100"
              >
                <div
                  className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden"
                  style={{
                    backgroundImage: `url(${
                      agent.image_url || "/placeholder-agent.png"
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                    <span className="text-2xl font-bold text-white">
                      {agent.name ? agent.name.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-base">{agent.name}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800/40 text-zinc-400">
                      Archived
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {agent.goal || agent.role}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
