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

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelect: (value: string | null) => void;
  disabled?: boolean;
}

export function AgentSelector({
  selectedAgentId,
  onSelect,
  disabled,
}: AgentSelectorProps) {
  const { agents, loading } = useAgents();
  const [internalSelectedId, setInternalSelectedId] = React.useState<
    string | null
  >(selectedAgentId);

  // Filter out archived agents
  const activeAgents = agents.filter((agent) => !agent.is_archived);

  React.useEffect(() => {
    if (!loading && activeAgents.length > 0) {
      if (!internalSelectedId && selectedAgentId !== null) {
        const newSelectedId = activeAgents[0].id;
        setInternalSelectedId(newSelectedId);
        onSelect(newSelectedId);
      } else if (
        internalSelectedId &&
        !activeAgents.some((agent) => agent.id === internalSelectedId)
      ) {
        // If the current selected ID is not in the agents list, select the first agent
        const newSelectedId = activeAgents[0].id;
        setInternalSelectedId(newSelectedId);
        onSelect(newSelectedId);
      }
    }
  }, [loading, activeAgents, internalSelectedId, onSelect, selectedAgentId]);

  React.useEffect(() => {
    setInternalSelectedId(selectedAgentId);
  }, [selectedAgentId]);

  const handleSelect = (value: string) => {
    const newValue = value === "none" ? null : value;
    setInternalSelectedId(newValue);
    onSelect(newValue);
  };

  const selectedAgent = activeAgents.find(
    (agent) => agent.id === internalSelectedId
  );

  if (loading) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-background/50 backdrop-blur-sm">
        <Bot className="h-4 w-4 animate-pulse text-foreground/50" />
      </div>
    );
  }

  return (
    <Select
      value={
        internalSelectedId === null ? "none" : internalSelectedId || undefined
      }
      onValueChange={handleSelect}
      disabled={disabled}
    >
      <SelectTrigger
        data-shape="circle"
        className="group h-11 w-11 rounded-full p-0 border-0 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200 [&>span]:!p-0 [&>svg]:hidden"
      >
        <SelectValue
          placeholder={
            <div className="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden ring-1 ring-border/10">
              <div className="relative h-full w-full">
                <Image
                  src="./logos/aibtcdev-avatar-250px.png"
                  alt="AI BTC Dev"
                  fill
                  className="object-cover"
                  priority
                  unoptimized={true}
                />
              </div>
            </div>
          }
        >
          {selectedAgent ? (
            selectedAgent.image_url ? (
              <div className="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden ring-1 ring-border/10">
                <div className="relative h-full w-full">
                  <Image
                    src={selectedAgent.image_url}
                    alt={selectedAgent.name}
                    fill
                    className="object-cover"
                    priority
                    unoptimized={true}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full">
                <Bot className="h-4 w-4 text-foreground/50" />
              </div>
            )
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden ring-1 ring-border/10">
              <div className="relative h-full w-full">
                <Image
                  src="https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-1000px.png"
                  alt="AI BTC Dev"
                  fill
                  className="object-cover"
                  priority
                  unoptimized={true}
                />
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="w-[300px]">
        <SelectItem value="none" className="py-2">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-border/10">
              <Image
                src="https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-1000px.png"
                alt="AI BTC Dev"
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <span className="text-sm font-medium truncate flex-1">
              Assistant
            </span>
          </div>
        </SelectItem>
        {activeAgents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id} className="py-2">
            <div className="flex items-center gap-2.5">
              {agent.image_url ? (
                <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-border/10">
                  <Image
                    src={agent.image_url}
                    alt={agent.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background">
                  <Bot className="h-3.5 w-3.5 text-foreground/50" />
                </div>
              )}
              <span className="text-sm font-medium truncate flex-1">
                {agent.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
