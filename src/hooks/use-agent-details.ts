import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/hooks/use-agent";

export function useAgentDetails() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async (id: string) => {
      setLoading(true);
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch agent details",
          variant: "destructive",
        });
        router.push("/agents");
        return;
      }

      setAgent(data);
      setLoading(false);
    };

    if (params.id) {
      fetchAgent(params.id as string);
    }
  }, [params.id, router, toast]);

  return {
    agent,
    loading,
  };
}
