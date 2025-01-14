"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Agent } from "@/types/supabase";
import { supabase } from "@/utils/supabase/client";
import { AgentDetailsPanel } from "@/components/agents/agent-details-panel";

export const runtime = "edge";

export default function AgentDetailsPage() {
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

  return <AgentDetailsPanel agent={agent} />;
}
