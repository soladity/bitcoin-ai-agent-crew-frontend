"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Schedule } from "@/types/supabase";
import { ScheduleSelector } from "../reusables/schedule-selector";

interface TaskEditModalProps {
  task: Schedule | null;
  open: boolean;
  onClose: () => void;
}

export function TaskEditModal({ task, open, onClose }: TaskEditModalProps) {
  const [formData, setFormData] = useState<Partial<Schedule>>({});

  useEffect(() => {
    if (task) {
      setFormData(task);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task?.id) return;

    const { error } = await supabase
      .from("schedules")
      .update({
        name: formData.name,
        task: formData.task,
        enabled: formData.enabled,
        cron: formData.cron,
      })
      .eq("id", task.id);

    if (error) {
      console.error("Error updating task:", error);
      return;
    }

    onClose();
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
              <Label htmlFor="task">Task</Label>
              <textarea
                id="task"
                value={formData.task || ""}
                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
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
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, enabled: checked })
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
