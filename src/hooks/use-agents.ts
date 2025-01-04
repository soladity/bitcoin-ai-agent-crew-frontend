import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Agent } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("agents")
          .select("*")
          .order("name");

        if (error) {
          throw error;
        }

        setAgents(data);
      } catch (error) {
        console.error("Error fetching agents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available agents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [toast]);

  return { agents, loading };
}
