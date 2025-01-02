"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Task } from "@/types/supabase";
import { ScheduleSelector } from "../reusables/schedule-selector";

interface TaskEditModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  agentId: string;
  profileId: string;
}

export function TaskEditModal({ task, open, onClose, agentId, profileId }: TaskEditModalProps) {

  const [formData, setFormData] = useState<Partial<Task>>({
    agent_id: agentId,
    is_scheduled: true,
    profile_id: profileId
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if task id is not provided, create a new task
    if (!task?.id) {
      const { error } = await supabase.from("tasks").insert([formData]);
      if (error) {
        console.error("Error creating task:", error);
        return;
      }
      onClose();
      return;
    } else {
      const { error } = await supabase
        .from("tasks")
        .update(formData)
        .eq("id", task?.id);

      if (error) {
        console.error("Error updating task:", error);
        return;
      }

      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Edit Task</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <textarea
                id="prompt"
                value={formData.prompt || ""}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <ScheduleSelector 
                value={formData.cron || ""} 
                onChange={(cron) => setFormData({ ...formData, cron: cron })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.is_scheduled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_scheduled: checked })
              }
            />
            <Label htmlFor="enabled">Enabled</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
