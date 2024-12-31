import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  image_url: string;
  tools: string[];
  description: string;
}

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
    tools: [],
    description: "",
  });

  const fetchAgent = async (id: string) => {
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

    setFormData(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isNewAgent = !params.id || params.id === "new";
    const { error } = isNewAgent
      ? await supabase.from("agents").insert([formData])
      : await supabase
          .from("agents")
          .update(formData)
          .eq("id", params.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save agent",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    toast({
      title: "Success",
      description: "Agent saved successfully",
    });
    router.push("/agents");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tools = e.target.value.split(",").map((tool) => tool.trim());
    setFormData((prev) => ({ ...prev, tools }));
  };

  return {
    loading,
    saving,
    formData,
    fetchAgent,
    handleSubmit,
    handleChange,
    handleToolsChange,
  };
}
