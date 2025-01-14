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

  const AgentImage = ({
    agent,
    className = "",
  }: {
    agent?: any;
    className?: string;
  }) => (
    <div
      className={`relative flex items-center justify-center rounded-full overflow-hidden ring-1 ring-border/10 ${className}`}
    >
      <div className="relative h-full w-full">
        <Image
          src={
            agent?.image_url ||
            "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-1000px.png"
          }
          alt={agent?.name || "AI BTC Dev"}
          fill
          className="object-cover"
          priority
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {agent?.name ? agent.name.charAt(0).toUpperCase() : "A"}
          </span>
        </div>
      </div>
    </div>
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
        <SelectValue placeholder={<AgentImage className="h-11 w-11" />}>
          {selectedAgent ? (
            selectedAgent.image_url ? (
              <AgentImage agent={selectedAgent} className="h-11 w-11" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full">
                <Bot className="h-4 w-4 text-foreground/50" />
              </div>
            )
          ) : (
            <AgentImage className="h-11 w-11" />
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="w-[300px]">
        <SelectItem value="none" className="py-2">
          <div className="flex items-center gap-2.5">
            <AgentImage className="h-7 w-7" />
            <span className="text-sm font-medium truncate flex-1">
              Assistant
            </span>
          </div>
        </SelectItem>
        {activeAgents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id} className="py-2">
            <div className="flex items-center gap-2.5">
              {agent.image_url ? (
                <AgentImage agent={agent} className="h-7 w-7" />
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

export default AgentSelector;
