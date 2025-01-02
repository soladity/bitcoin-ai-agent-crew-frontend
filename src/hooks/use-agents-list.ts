import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/types/supabase";

export function useAgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
    // need data to be in Agent[] type
    const { data, error } = await supabase
      .from("agents")
      .select("*");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      });
      return;
    }


    const agents = data as Agent[];

    for (const agent of agents) {
      console.log(agent);
    }
    setAgents(agents || []);
  }, [toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    fetchAgents,
  };
}
