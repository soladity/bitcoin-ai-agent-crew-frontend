import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2Icon } from "lucide-react";
import {  Agent } from "@/types/supabase";

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
        <div className="flex justify-end">
          <Link href={`/agents/${agent.id}/edit`}>
            <Button>
              <Edit2Icon className="mr-2 h-4 w-4" />
              Edit Agent
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
