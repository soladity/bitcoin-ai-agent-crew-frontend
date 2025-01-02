import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent } from "@/types/supabase";

interface AgentDetailsCardProps {
  agent: Agent;
}

export function AgentDetailsCard({ agent }: AgentDetailsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
        <p className="text-lg text-muted-foreground mb-4">{agent.role}</p>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Goal</h2>
            <p>{agent.goal}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Backstory</h2>
            <p>{agent.backstory}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Role</h2>
            <p>{agent.role}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Tools</h2>
            <div className="flex flex-wrap gap-2">
              {agent.agent_tools?.map((tool) => (
                <Badge key={tool} variant="secondary">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
