"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgentForm } from "@/components/agents/agent-form";
import { Agent } from "@/types/supabase";
import { supabase } from "@/utils/supabase/client";
import { useSessionStore } from "@/store/session";

export default function NewAgentPage() {
  const router = useRouter();
  const { userId } = useSessionStore();
  const [agent, setAgent] = useState<Partial<Agent>>({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    image_url: "",
    profile_id: userId || "",
    agent_tools: [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      const { error } = await supabase.from("agents").insert(agent);

      if (error) throw error;
      router.push("/agents");
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolsChange = (tools: string[]) => {
    setAgent((prev) => ({ ...prev, agent_tools: tools }));
  };

  return (
    <aside className="h-full flex-1 border-r border-zinc-800/40 bg-black/10 flex flex-col">
      <div className="p-4 border-b border-zinc-800/40">
        <h2 className="text-sm font-medium text-zinc-200">New Agent</h2>
      </div>

      <div className="flex-grow overflow-auto p-4">
        <AgentForm
          formData={agent}
          saving={saving}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onToolsChange={handleToolsChange}
        />
      </div>
    </aside>
  );
}
