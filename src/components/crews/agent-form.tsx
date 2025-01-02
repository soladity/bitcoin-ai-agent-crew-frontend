"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { AgentFormProps } from "@/types/supabase";
import { TOOL_CATEGORIES, ToolCategory, fetchTools, Tool } from "@/lib/tools";
import { useProfile } from "@/hooks/use-profile";

export default function AgentForm({
  agent,
  onSubmit,
  loading,
}: AgentFormProps) {
  const { user: profile } = useProfile();
  const [agentName, setAgentName] = useState(agent?.name || "");
  const [role, setRole] = useState(agent?.role || "");
  const [goal, setGoal] = useState(agent?.goal || "");
  const [backstory, setBackstory] = useState(agent?.backstory || "");
  const [selectedTools, setSelectedTools] = useState<string[]>(
    agent?.agent_tools || []
  );
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);

  useEffect(() => {
    const loadTools = async () => {
      setIsLoadingTools(true);
      try {
        const tools = await fetchTools();
        setAvailableTools(tools);
      } catch (error) {
        console.error("Failed to load tools:", error);
      } finally {
        setIsLoadingTools(false);
      }
    };
    loadTools();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: agentName,
      role,
      goal,
      backstory,
      agent_tools: selectedTools,
      image_url: "",
      profile_id: profile?.id || "",
    });
  };

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const filteredTools = availableTools.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="agentName">Agent Name</Label>
        <Input
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Enter agent name"
          required
        />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter role"
          required
        />
      </div>
      <div>
        <Label htmlFor="goal">Goal</Label>
        <Input
          id="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Enter goal"
          required
        />
      </div>
      <div>
        <Label htmlFor="backstory">Backstory</Label>
        <Textarea
          id="backstory"
          value={backstory}
          onChange={(e) => setBackstory(e.target.value)}
          placeholder="Enter backstory"
        />
      </div>
      <div>
        <Label>Agent Tools</Label>
        <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedTools.length > 0
                ? `${selectedTools.length} tool${
                    selectedTools.length > 1 ? "s" : ""
                  } selected`
                : "Select tools"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Select Tools</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow px-6">
              <div className="sticky top-0 bg-background pt-4 pb-2 z-10">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                  />
                </div>
              </div>
              {isLoadingTools ? (
                <div className="p-4 text-center">Loading tools...</div>
              ) : (
                Object.keys(TOOL_CATEGORIES).map((category) => {
                  const categoryTools = filteredTools.filter(
                    (tool) => tool.category === category
                  );
                  if (categoryTools.length === 0) return null;

                  return (
                    <div key={category} className="mb-6">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                        {TOOL_CATEGORIES[category as ToolCategory]}
                      </h3>
                      {categoryTools.map((tool) => (
                        <div
                          key={tool.id}
                          className="flex items-start space-x-2 p-2"
                        >
                          <Checkbox
                            id={tool.id}
                            checked={selectedTools.includes(tool.id)}
                            onCheckedChange={() => handleToolToggle(tool.id)}
                          />
                          <div className="flex flex-col">
                            <label
                              htmlFor={tool.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {tool.name}
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </ScrollArea>
            <div className="p-6 pt-2 border-t">
              <Button onClick={() => setIsToolDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTools.map((tool) => (
          <div
            key={tool}
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
          >
            {tool}
            <button
              type="button"
              onClick={() => handleToolToggle(tool)}
              className="ml-2 text-primary-foreground hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : agent ? "Update Agent" : "Create Agent"}
      </Button>
    </form>
  );
}
