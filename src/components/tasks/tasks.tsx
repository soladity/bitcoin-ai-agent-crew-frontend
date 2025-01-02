"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import { TaskEditModal } from "./task-edit-modal";
import { supabase } from "@/utils/supabase/client";
import { Task} from "@/types/supabase";
import { useProfile } from "@/hooks/use-profile";

interface TasksTableProps {
  agentId: string;
}


export function TasksTable({ agentId }: TasksTableProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: profileId } = useProfile();

  useEffect(() => {
    fetchTasks();
  }, );

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    setTasks(data || []);
  };

  const handleEditClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
    fetchTasks(); // Refresh the table after editing
  };

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell className="max-w-md truncate">{task.prompt}</TableCell>
                <TableCell>
                  <Badge variant={task.is_scheduled ? "default" : "destructive"}>
                    {task.is_scheduled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>{task.cron}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(task)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col space-y-2 p-4 border rounded-lg"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{task.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(task)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {task.prompt}
            </div>
            <div className="flex justify-between items-center">
              <Badge variant={task.is_scheduled ? "default" : "destructive"}>
                {task.is_scheduled ? "Enabled" : "Disabled"}
              </Badge>
              <span className="text-sm">{task.cron}</span>
            </div>
          </div>
        ))}
      </div>

      <TaskEditModal
        task={selectedTask}
        agentId={agentId}
        open={isModalOpen}
        onClose={handleModalClose}
        profileId={profileId?.id || ""}
      />
    </>
  );
}
