"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
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
import { PlusIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import AgentForm from "./AgentForm";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Agent, AgentManagementProps } from "@/types/supabase";

export default function AgentManagement({
  crewId,
  onAgentAdded,
}: AgentManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const { toast } = useToast();

  const fetchAgents = useCallback(async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
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

  useEffect(() => {
    fetchAgents();
  }, [crewId, fetchAgents]);

  const handleSubmit = async (agentData: Omit<Agent, "id">) => {
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

      const formattedAgentTools = `{${agentData.agent_tools.join(",")}}`;

      let error;

      if (editingAgent) {
        const { error: updateError } = await supabase
          .from("agents")
          .update({ ...agentData, agent_tools: formattedAgentTools })
          .eq("id", editingAgent.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("agents").insert({
          ...agentData,
          agent_tools: formattedAgentTools,
          crew_id: crewId,
          profile_id: user.id,
        });
        error = insertError;
      }

      if (error) throw error;

      setIsDialogOpen(false);
      toast({
        title: editingAgent ? "Agent updated" : "Agent created",
        description: editingAgent
          ? "The agent has been successfully updated."
          : "The new agent has been successfully created.",
      });
      onAgentAdded();
      fetchAgents();
      setEditingAgent(null);
    } catch (error) {
      console.error(
        editingAgent ? "Error updating agent:" : "Error creating agent:",
        error
      );
      toast({
        title: "Error",
        description: editingAgent
          ? "Failed to update the agent. Please try again."
          : "Failed to create the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsDialogOpen(true);
  };

  const handleDeleteAgent = async (agentId: number) => {
    try {
      // First delete all tasks associated with the agent
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("agent_id", agentId);

      if (tasksError) throw tasksError;

      // Then delete the agent
      const { error: agentError } = await supabase
        .from("agents")
        .delete()
        .eq("id", agentId);

      if (agentError) throw agentError;

      toast({
        title: "Success",
        description: "Agent and associated tasks deleted successfully",
      });
      onAgentAdded(); // Refresh the agent list
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete the agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mt-4">
        <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingAgent(null);
          }}
        >
          <DialogTrigger asChild>
            <Button >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Edit Agent" : "Create New Agent"}
              </DialogTitle>
            </DialogHeader>
            <AgentForm
              agent={editingAgent || undefined}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Input
        placeholder="Search agents..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm mb-4"
      />
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Goal</TableHead>
              <TableHead>Backstory</TableHead>
              <TableHead>Assigned Tools</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAgents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link">
                        {agent.role.substring(0, 20)}...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>{agent.role}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link">
                        {agent.goal.substring(0, 20)}...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>{agent.goal}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="link">
                        {agent.backstory.substring(0, 20)}...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>{agent.backstory}</p>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {agent.agent_tools.map((tool, index) => (
                      <Badge key={index} variant="secondary">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAgent(agent)}
                    >
                      <Edit2Icon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
