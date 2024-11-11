"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { CrewFormProps, Crew } from "@/types/supabase";

export default function CrewForm({ onCrewCreated, onClose }: CrewFormProps) {
  const [crewName, setCrewName] = useState("");
  const [crewDescription, setCrewDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await supabase
        .from("crews")
        .insert({
          name: crewName,
          description: crewDescription,
          profile_id: user.id,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      const newCrew: Crew = {
        id: data.id,
        name: data.name,
        description: data.description,
        created_at: data.created_at,
        is_public: data.is_public,
      };

      setCrewName("");
      setCrewDescription("");
      setIsPublic(false);
      onClose();
      onCrewCreated(newCrew);
      toast({
        title: "Crew created",
        description: "The new crew has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating crew:", error);
      toast({
        title: "Error",
        description: "Failed to create the crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="crewName">Crew Name</Label>
        <Input
          id="crewName"
          value={crewName}
          onChange={(e) => setCrewName(e.target.value)}
          placeholder="Enter crew name"
          required
        />
      </div>
      <div>
        <Label htmlFor="crewDescription">Description</Label>
        <Textarea
          id="crewDescription"
          value={crewDescription}
          onChange={(e) => setCrewDescription(e.target.value)}
          placeholder="Enter crew description"
          rows={3}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is-public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
        <Label htmlFor="is-public">Make crew public</Label>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Crew"}
      </Button>
    </form>
  );
}
