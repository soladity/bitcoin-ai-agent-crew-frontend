"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Edit2Icon } from "lucide-react";
import TaskForm from "./TaskForm";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface Agent {
  id: number;
  name: string;
}

interface Task {
  id: number;
  description: string;
  expected_output: string;
  agent_id: number;
  profile_id: string;
}

interface TaskManagementProps {
  crewId: number;
  onTaskAdded: () => void;
}

export default function TaskManagement({
  crewId,
  onTaskAdded,
}: TaskManagementProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name")
      .eq("crew_id", crewId);
    if (error) {
      console.error("Error fetching agents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch agents. Please try again.",
        variant: "destructive",
      });
    } else {
      setAgents(data);
    }
  }, [crewId, toast]);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("crew_id", crewId);
    if (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks. Please try again.",
        variant: "destructive",
      });
    } else {
      setTasks(data);
    }
  }, [crewId, toast]);

  useEffect(() => {
    fetchAgents();
    fetchTasks();
    fetchCurrentUser();
  }, [crewId, fetchAgents, fetchTasks]);

  const fetchCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching current user:", error);
    } else if (user) {
      setCurrentUser(user.id);
    }
  };

  const handleTaskSubmitted = () => {
    fetchTasks();
    onTaskAdded();
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const getAgentName = (agentId: number) => {
    const agent = agents.find((a) => a.id === agentId);
    return agent ? agent.name : "Unassigned";
  };

  const filteredTasks = tasks.filter((task) =>
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight mt-2">Tasks</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Create New Task"}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              crewId={crewId}
              agents={agents}
              task={editingTask || undefined}
              onTaskSubmitted={handleTaskSubmitted}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingTask(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Input
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm mb-4"
      />
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Expected Output</TableHead>
              <TableHead>Assigned Agent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link">
                        {task.description.substring(0, 30)}...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>{task.description}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link">
                        {task.expected_output.substring(0, 30)}...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>{task.expected_output}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>{getAgentName(task.agent_id)}</TableCell>
                <TableCell>
                  {currentUser === task.profile_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit2Icon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
