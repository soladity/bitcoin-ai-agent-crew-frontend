"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { CrewFormProps, Crew, CronEntry } from "@/types/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";

export default function CrewForm({
  onCrewCreated,
  onClose,
  editingCrew,
}: CrewFormProps) {
  const [crewName, setCrewName] = useState(editingCrew?.name || "");
  const [crewDescription, setCrewDescription] = useState(
    editingCrew?.description || ""
  );
  const [isPublic, setIsPublic] = useState(editingCrew?.is_public || false);
  const [hasCron, setHasCron] = useState(false);
  const [cronInput, setCronInput] = useState("");
  const [cronEnabled, setCronEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCrew?.cron) {
      setHasCron(true);
      setCronInput(editingCrew.cron.input);
      setCronEnabled(editingCrew.cron.enabled);
    }
  }, [editingCrew]);

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

      // Create or update crew
      const crewOperation = editingCrew
        ? supabase
            .from("crews")
            .update({
              name: crewName,
              description: crewDescription,
              is_public: isPublic,
            })
            .eq("id", editingCrew.id)
        : supabase.from("crews").insert({
            name: crewName,
            description: crewDescription,
            profile_id: user.id,
            is_public: isPublic,
          });

      const { data: crewData, error: crewError } = await crewOperation
        .select()
        .single();
      if (crewError) throw crewError;

      // Handle cron entry
      if (hasCron) {
        if (editingCrew?.cron?.id) {
          // Update existing cron
          const { error: cronError } = await supabase
            .from("crons")
            .update({
              input: cronInput,
              enabled: cronEnabled,
            })
            .eq("id", editingCrew.cron.id);
          if (cronError) throw cronError;
        } else {
          // Create new cron
          const { error: cronError } = await supabase.from("crons").insert({
            profile_id: user.id,
            crew_id: crewData.id,
            enabled: cronEnabled,
            input: cronInput,
          });
          if (cronError) throw cronError;
        }
      } else if (editingCrew?.cron?.id) {
        // Remove existing cron if hasCron is false
        const { error: cronError } = await supabase
          .from("crons")
          .delete()
          .eq("id", editingCrew.cron.id);
        if (cronError) throw cronError;
      }

      // Fetch the updated crew with cron data
      const { data: updatedCrewData, error: fetchError } = await supabase
        .from("crews")
        .select(
          `
          *,
          crons (
            id,
            enabled,
            input
          )
        `
        )
        .eq("id", crewData.id)
        .single();

      if (fetchError) throw fetchError;

      const newCrew = {
        ...updatedCrewData,
        cron: updatedCrewData.crons?.[0] || null,
      };

      onCrewCreated(newCrew);
      onClose();

      toast({
        title: editingCrew ? "Crew updated" : "Crew created",
        description: editingCrew
          ? "The crew has been successfully updated."
          : "The new crew has been successfully created.",
      });
    } catch (error) {
      console.error("Error creating/updating crew:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          editingCrew ? "update" : "create"
        } the crew. Please try again.`,
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
      <div className="flex items-center space-x-2">
        <Checkbox
          id="has-cron"
          checked={hasCron}
          onCheckedChange={(checked) => setHasCron(checked as boolean)}
        />
        <Label htmlFor="has-cron">Enable Cron</Label>
      </div>
      {hasCron && (
        <div className="space-y-2">
          <div>
            <Label htmlFor="cronInput">Cron Input</Label>
            <Input
              id="cronInput"
              value={cronInput}
              onChange={(e) => setCronInput(e.target.value)}
              placeholder="Enter cron input"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="cron-enabled"
              checked={cronEnabled}
              onCheckedChange={setCronEnabled}
            />
            <Label htmlFor="cron-enabled">Enable Cron Job</Label>
          </div>
          {/* {cronId && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveCron}
            >
              Remove Cron Entry
            </Button>
          )}   */}
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {editingCrew ? "Updating..." : "Creating..."}
          </>
        ) : editingCrew ? (
          "Update Crew"
        ) : (
          "Create Crew"
        )}
      </Button>
    </form>
  );
}
