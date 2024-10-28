"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import AgentManagement from "@/components/agents/AgentManagement";
import TaskManagement from "@/components/tasks/TaskManagement";
import ExecutionPanel from "@/components/dashboard/Execution";
import { Card, CardContent } from "@/components/ui/card";

interface Crew {
  id: number;
  name: string;
}

interface Agent {
  id: number;
  name: string;
  role: string;
}

interface Task {
  id: number;
  description: string;
  expected_output: string;
  agent_id: number;
  profile_id: string;
}

export default function CrewDetails() {
  const params = useParams();
  const id = params.id as string;
  const [crew, setCrew] = useState<Crew | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching current user:", error);
      return;
    }
    if (user) {
      setCurrentUser(user.id);
    }
  }, []);

  const fetchCrew = useCallback(async () => {
    const { data, error } = await supabase
      .from("crews")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching crew:", error);
      return;
    }
    setCrew(data);
  }, [id]);

  const fetchAgents = useCallback(async () => {
    console.log("Fetching agents...");
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("crew_id", id);
    if (error) {
      console.error("Error fetching agents:", error);
      return;
    }
    console.log("Agents fetched:", data);
    setAgents(data);
  }, [id]);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("crew_id", id);
    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }
    setTasks(data);
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    if (id) {
      fetchCrew();
      fetchCurrentUser();
      fetchAgents();
      fetchTasks();
    }
  }, [id, fetchCrew, fetchCurrentUser, fetchAgents, fetchTasks]);

  const handleAgentAdded = useCallback(async () => {
    await fetchAgents();
  }, [fetchAgents]);

  const handleTaskAdded = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const handleEditTask = useCallback(async () => {
    await fetchAgents(); // to ensure we have the latest agents when editing
  }, [fetchAgents]);

  if (!crew) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{crew.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardContent>
              <AgentManagement
                crewId={crew.id}
                onAgentAdded={handleAgentAdded}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <TaskManagement
                crewId={crew.id}
                onTaskAdded={handleTaskAdded}
                tasks={tasks}
                agents={agents}
                currentUser={currentUser}
                onEditTask={handleEditTask}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <ExecutionPanel crewName={crew.name} crewId={crew.id} />
        </div>
      </div>
    </div>
  );
}
