import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Agent } from "@/types/supabase";

export function useAgent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    image_url: "",
    agent_tools: [],
  });

  const fetchAgent = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch agent details",
        variant: "destructive",
      });
      router.push("/agents");
    } finally {
      setLoading(false);
    }
  }, [toast, router]);

  useEffect(() => {
    if (params.id && params.id !== "new") {
      fetchAgent(params.id as string);
    } else {
      setLoading(false);
    }
  }, [params.id, fetchAgent]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Special handling for tools field
    if (name === 'tools') {
      const toolsArray = value.split(',').map(tool => tool.trim()).filter(Boolean);
      setFormData(prev => ({ ...prev, [name]: toolsArray }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = params.id && params.id !== "new"
        ? await supabase
            .from("agents")
            .update(formData)
            .eq("id", params.id)
        : await supabase
            .from("agents")
            .insert([formData])
            .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agent saved successfully",
      });

      router.push("/agents");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [formData, params.id, router, toast]);

  return {
    loading,
    saving,
    formData,
    handleSubmit,
    handleChange,
  };
}
