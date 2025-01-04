import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAgents } from "@/hooks/use-agents";

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onSelect: (agentId: string) => void;
}

export function AgentSelector({ selectedAgentId, onSelect }: AgentSelectorProps) {
  const { agents, loading } = useAgents();

  if (loading) {
    return <div>Loading agents...</div>;
  }

  return (
    <Select value={selectedAgentId || undefined} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select an agent" />
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            {agent.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
