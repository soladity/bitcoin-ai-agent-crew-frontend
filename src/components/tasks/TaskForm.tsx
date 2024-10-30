"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskFormProps } from "@/types/supabase";

export default function TaskForm({
  crewId,
  agents,
  task,
  onTaskSubmitted,
  onClose,
}: TaskFormProps) {
  const [description, setDescription] = useState(task?.description || "");
  const [expectedOutput, setExpectedOutput] = useState(
    task?.expected_output || ""
  );
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(
    task?.agent_id || null
  );
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

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

      const taskData = {
        description,
        expected_output: expectedOutput,
        agent_id: selectedAgentId,
        crew_id: crewId,
        profile_id: user.id,
      };

      let error;

      if (isEditing) {
        const { error: updateError } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", task.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tasks")
          .insert(taskData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: isEditing ? "Task updated" : "Task created",
        description: isEditing
          ? "The task has been successfully updated."
          : "The new task has been successfully created.",
      });
      onTaskSubmitted();
      onClose();
    } catch (error) {
      console.error(
        isEditing ? "Error updating task:" : "Error creating task:",
        error
      );
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update the task. Please try again."
          : "Failed to create the task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Task Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          required
        />
      </div>
      <div>
        <Label htmlFor="expectedOutput">Expected Output</Label>
        <Textarea
          id="expectedOutput"
          value={expectedOutput}
          onChange={(e) => setExpectedOutput(e.target.value)}
          placeholder="Enter expected output"
          required
        />
      </div>
      <div>
        <Label htmlFor="agent">Assign to Agent</Label>
        <Select
          value={selectedAgentId?.toString()}
          onValueChange={(value) => setSelectedAgentId(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            {agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
            ? "Update Task"
            : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
