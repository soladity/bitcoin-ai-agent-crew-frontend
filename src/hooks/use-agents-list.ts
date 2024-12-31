import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/hooks/use-agent";

export function useAgentsList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
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

    setAgents(data || []);
  }, [toast]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    fetchAgents,
  };
}
