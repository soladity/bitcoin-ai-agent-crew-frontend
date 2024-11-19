"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { CrewFormProps, Crew, CornEntry } from "@/types/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";

export default function CornCrewForm({
  onCrewCreated,
  onClose,
  editingCrew,
}: CrewFormProps) {
  const [crewName, setCrewName] = useState(editingCrew?.name || "");
  const [crewDescription, setCrewDescription] = useState(
    editingCrew?.description || ""
  );
  const [isPublic, setIsPublic] = useState(editingCrew?.is_public || false);
  const [addToCorn, setAddToCorn] = useState(false);
  const [cornInput, setCornInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cornEntries, setCornEntries] = useState<CornEntry[]>([]);

  useEffect(() => {
    if (editingCrew) {
      fetchCornEntries(editingCrew.id);
    }
  }, [editingCrew]);

  const fetchCornEntries = async (crewId: number) => {
    const { data, error } = await supabase
      .from("corn")
      .select("*")
      .eq("crew_id", crewId);

    if (error) {
      console.error("Error fetching corn entries:", error);
    } else {
      setCornEntries(data || []);
    }
  };

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

      let crewData;
      if (editingCrew) {
        const { data, error } = await supabase
          .from("crews")
          .update({
            name: crewName,
            description: crewDescription,
            is_public: isPublic,
          })
          .eq("id", editingCrew.id)
          .select()
          .single();

        if (error) throw error;
        crewData = data;
      } else {
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
        crewData = data;
      }

      if (addToCorn && cornInput) {
        const { error: cornError } = await supabase.from("corn").insert({
          profile_id: user.id,
          crew_id: crewData.id,
          enabled: true,
          input: cornInput,
        });

        if (cornError) throw cornError;
      }

      const newCrew: Crew = {
        id: crewData.id,
        name: crewData.name,
        description: crewData.description,
        created_at: crewData.created_at,
        is_public: crewData.is_public,
      };

      setCrewName("");
      setCrewDescription("");
      setIsPublic(false);
      setAddToCorn(false);
      setCornInput("");
      onClose();
      onCrewCreated(newCrew);
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

  const handleUpdateCorn = async (cornId: number, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("corn")
        .update({ enabled })
        .eq("id", cornId);

      if (error) throw error;

      setCornEntries(
        cornEntries.map((entry) =>
          entry.id === cornId ? { ...entry, enabled } : entry
        )
      );

      toast({
        title: "Corn entry updated",
        description: `The corn entry has been ${
          enabled ? "enabled" : "disabled"
        }.`,
      });
    } catch (error) {
      console.error("Error updating corn entry:", error);
      toast({
        title: "Error",
        description: "Failed to update the corn entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCorn = async (cornId: number) => {
    try {
      const { error } = await supabase.from("corn").delete().eq("id", cornId);

      if (error) throw error;

      setCornEntries(cornEntries.filter((entry) => entry.id !== cornId));

      toast({
        title: "Corn entry deleted",
        description: "The corn entry has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting corn entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete the corn entry. Please try again.",
        variant: "destructive",
      });
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
      {!editingCrew && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="add-to-corn"
            checked={addToCorn}
            onCheckedChange={(checked) => setAddToCorn(checked as boolean)}
          />
          <Label htmlFor="add-to-corn">Add to Corn</Label>
        </div>
      )}
      {(addToCorn || editingCrew) && (
        <div>
          <Label htmlFor="cornInput">Corn Input</Label>
          <Input
            id="cornInput"
            value={cornInput}
            onChange={(e) => setCornInput(e.target.value)}
            placeholder="Enter corn input"
          />
        </div>
      )}
      {editingCrew && cornEntries.length > 0 && (
        <div>
          <Label>Existing Corn Entries</Label>
          <ul className="space-y-2 mt-2">
            {cornEntries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={entry.enabled}
                    onCheckedChange={(checked) =>
                      handleUpdateCorn(entry.id, checked)
                    }
                  />
                  <span>{entry.input}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCorn(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
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
