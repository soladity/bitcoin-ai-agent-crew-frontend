import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Agent } from "@/types/supabase";

interface AgentProfileCardProps {
  agent: Agent;
}

export function AgentProfileCard({ agent }: AgentProfileCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="relative h-64 mb-4">
          <Image
            src={agent.image_url || "/placeholder-agent.png"}
            alt={agent.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex">
          <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
        </div>
      </CardContent>
    </Card>
  );
}
