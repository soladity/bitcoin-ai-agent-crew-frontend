"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { useAgentsList } from "@/hooks/use-agents-list";
import Image from "next/image";

export const runtime = "edge";

export default function AgentsPage() {
  const { agents } = useAgentsList();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex w-full flex-wrap items-center justify-between gap-4 pb-8">
        <div>
          <Heading>Agent Store</Heading>
          <p className="text-muted-foreground mt-1">
            Discover and deploy AI agents for your needs
          </p>
        </div>
        <Link href="/agents/new">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Agent
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map((agent) => (
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
                unoptimized={true}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {agent.goal || agent.role}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
