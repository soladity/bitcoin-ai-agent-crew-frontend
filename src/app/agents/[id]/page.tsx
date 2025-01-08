"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { Agent } from "@/types/supabase";
import { supabase } from "@/utils/supabase/client";

export const runtime = "edge";

export default function AgentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        setAgent(data);
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchAgent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-zinc-500">
        Loading agent...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-zinc-500">
        Agent not found
      </div>
    );
  }

  return (
    <aside className="h-full flex-1 border-r border-zinc-800/40 bg-black/10 flex flex-col">
      <div className="p-4 border-b border-zinc-800/40">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">Agent Details</h2>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/5"
            onClick={() => router.push(`/agents/${agent.id}/edit`)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-zinc-800/40">
              <AvatarImage src={agent.image_url || undefined} />
              <AvatarFallback className="bg-black/20 text-zinc-500 text-sm">
                {agent.name?.[0]?.toUpperCase() || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-medium text-zinc-200">
                {agent.name}
              </h3>
              <p className="text-xs text-zinc-500">{agent.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-zinc-400 mb-1">Goal</h4>
              <p className="text-sm text-zinc-300">{agent.goal}</p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-zinc-400 mb-1">
                Backstory
              </h4>
              <p className="text-sm text-zinc-300">{agent.backstory}</p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-zinc-400 mb-2">Tools</h4>
              <div className="flex flex-wrap gap-1.5">
                {agent.agent_tools?.map((tool) => (
                  <div
                    key={tool}
                    className="bg-black/20 text-zinc-300 px-2 py-1 rounded text-xs"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
