import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Edit2Icon } from "lucide-react";
import { Agent } from "@/hooks/use-agent";

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="relative h-40">
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
          {agent.tools?.slice(0, 3).map((tool) => (
            <Badge key={tool} variant="secondary">
              {tool}
            </Badge>
          ))}
          {agent.tools?.length > 3 && (
            <Badge variant="secondary">+{agent.tools.length - 3}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Link href={`/agents/${agent.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        <Link href={`/agents/${agent.id}/edit`}>
          <Button>
            <Edit2Icon className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
