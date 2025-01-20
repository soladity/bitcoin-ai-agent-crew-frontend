"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Task } from "@/types/supabase";
import { CronScheduleSelector } from "./cron-schedule-selector";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface TaskEditModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  agentId: string;
  profileId: string;
}

export function TaskEditModal({
  task,
  open,
  onClose,
  agentId,
  profileId,
}: TaskEditModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    agent_id: agentId,
    is_scheduled: true,
    profile_id: profileId,
    cron: "* * * * *", // Default to every minute
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        agent_id: agentId,
        is_scheduled: true,
        profile_id: profileId,
        cron: "* * * * *",
      });
    }
  }, [task, agentId, profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!task?.id) {
        const { error } = await supabase.from("tasks").insert([formData]);
        if (error) throw error;

        toast({
          title: "Success",
          description: "Task created successfully",
        });
      } else {
        const { error } = await supabase
          .from("tasks")
          .update(formData)
          .eq("id", task.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: "Failed to save task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 sm:p-6 h-full overflow-y-auto"
        >
          <SheetHeader className="p-6 sm:p-0 border-b sm:border-0">
            <SheetTitle>{task ? "Edit Task" : "Create Task"}</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 sm:p-0 sm:pt-6"
          >
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter task name"
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  placeholder="Enter task prompt"
                  required
                  className="min-h-[100px] w-full"
                />
              </div>
              <div className="space-y-2">
                <CronScheduleSelector
                  value={formData.cron || "* * * * *"}
                  onChange={(cron) => setFormData({ ...formData, cron })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Switch
                id="enabled"
                checked={formData.is_scheduled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_scheduled: checked })
                }
              />
              <Label htmlFor="enabled">Enable Scheduling</Label>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between space-y-4 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4 border-t">
              {task?.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-background hover:bg-background/80 w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              )}
              <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  {task ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
