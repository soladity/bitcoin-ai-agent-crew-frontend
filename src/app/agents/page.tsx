"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Archive } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { useAgentsList } from "@/hooks/use-agents-list";
import Image from "next/image";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activeAgents.map((agent) => (
          <Link
            href={`/agents/${agent.id}`}
            key={agent.id}
            className="group relative bg-card hover:bg-muted transition-colors duration-200 rounded-lg overflow-hidden"
          >
            <div className="aspect-[4/3] relative">
              <Image
                src={agent.image_url || "/placeholder-agent.png"}
                alt={agent.name}
                fill
                className="pt-5 object-contain md:object-cover md:pt-0 rounded"
                unoptimized={true}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-center">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {/* {agent.goal || agent.role} */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {archivedAgents.map((agent) => (
              <Link
                href={`/agents/${agent.id}`}
                key={agent.id}
                className="group relative bg-card hover:bg-muted transition-colors duration-200 rounded-lg overflow-hidden opacity-75 hover:opacity-100"
              >
                <div className="aspect-[4/3] relative grayscale group-hover:grayscale-0 transition-all duration-200">
                  <Image
                    src={agent.image_url || "/placeholder-agent.png"}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-lg">{agent.name}</h3>
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
