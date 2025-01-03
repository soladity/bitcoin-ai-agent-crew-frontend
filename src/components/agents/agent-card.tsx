import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Agent } from "@/types/supabase";
interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="flex flex-col group relative transition-colors duration-200 hover:bg-muted">
      <Link href={`/agents/${agent.id}`} className="flex-1">
        <div className="cursor-pointer">
          <CardHeader className="relative aspect-square">
            <div className="w-full h-full relative rounded-t-lg overflow-hidden">
              <Image
                src={agent.image_url || "/placeholder-agent.png"}
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <h3 className="font-semibold text-xl mb-2">{agent.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{agent.role}</p>
            <p className="text-sm line-clamp-2 mb-4">{agent.goal}</p>
            <div className="flex flex-wrap gap-1">
              {agent.agent_tools?.slice(0, 3).map((tool) => (
                <Badge key={tool} variant="secondary">
                  {tool}
                </Badge>
              ))}
              {agent.agent_tools?.length > 3 && (
                <Badge variant="secondary">+{agent.agent_tools.length - 3}</Badge>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
      <CardFooter className="flex justify-end gap-2">

      </CardFooter>
    </Card>
  );
}
