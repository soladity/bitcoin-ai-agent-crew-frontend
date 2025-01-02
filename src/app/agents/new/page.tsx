"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Agent } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { AgentForm } from "@/components/agents/agent-form";

export default function NewAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    agent_tools: [],
    image_url: "",
    profile_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    formData.profile_id = user?.id as string;
    try {
      const { error } = await supabase
        .from("agents")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agent created successfully",
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
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolsChange = (tools: string[]) => {
    setFormData((prev) => ({ ...prev, agent_tools: tools }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Agent</h1>
      <AgentForm
        formData={formData}
        saving={loading}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onToolsChange={handleToolsChange}
      />
    </div>
  );
}
