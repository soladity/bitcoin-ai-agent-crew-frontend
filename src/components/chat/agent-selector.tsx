"use client";

import * as React from "react";
import { Bot } from "lucide-react";
import Image from "next/image";
import { useAgents } from "@/hooks/use-agents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export function AgentSelector({
  selectedAgentId,
  onSelect,
  disabled,
}: AgentSelectorProps) {
  const { agents, loading } = useAgents();
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId);

  useEffect(() => {
    if (!loading && agents.length > 0 && !selectedAgentId) {
      onSelect(agents[0].id);
    }
  }, [loading, agents, selectedAgentId, onSelect]);

  if (loading) {
    return <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
      <Bot className="h-4 w-4 animate-pulse" />
    </div>;
  }

  return (
    <Select value={selectedAgentId || undefined} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className="h-11 w-11 rounded-full p-0 [&>svg]:hidden">
        <SelectValue placeholder={
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800">
            <Bot className="h-5 w-5 text-zinc-400" />
          </div>
        }>
          {selectedAgent && (
            selectedAgent.image_url ? (
              <div className="relative h-11 w-11 rounded-full overflow-hidden">
                <Image
                  src={selectedAgent.image_url}
                  alt={selectedAgent.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800">
                <Bot className="h-5 w-5 text-zinc-400" />
              </div>
            )
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id} className="py-2">
            <div className="flex items-center gap-2">
              {agent.image_url ? (
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={agent.image_url}
                    alt={agent.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                  <Bot className="h-4 w-4 text-zinc-400" />
                </div>
              )}
              <span className="text-sm">{agent.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
