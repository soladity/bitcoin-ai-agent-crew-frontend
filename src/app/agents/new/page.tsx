"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Agent } from "@/types/supabase";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";

export default function NewAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Agent, "id">>({
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Agent</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Goal</label>
          <textarea
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Backstory</label>
          <textarea
            value={formData.backstory}
            onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tools (comma-separated)</label>
          <input
            type="text"
            value={formData.agent_tools.join(",")}
            onChange={(e) => setFormData({ ...formData, agent_tools: e.target.value.split(",").map(t => t.trim()) })}
            className="w-full p-2 border rounded"
            placeholder="tool1, tool2, tool3"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Agent"}
        </button>
      </form>
    </div>
  );
}
