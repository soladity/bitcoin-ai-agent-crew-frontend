"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { AgentFormProps } from "@/types/supabase";
import { TOOL_CATEGORIES, ToolCategory, fetchTools, Tool } from "@/lib/tools";

export default function AgentForm({
  agent,
  onSubmit,
  loading,
}: AgentFormProps) {
  const [agentName, setAgentName] = useState(agent?.name || "");
  const [role, setRole] = useState(agent?.role || "");
  const [goal, setGoal] = useState(agent?.goal || "");
  const [backstory, setBackstory] = useState(agent?.backstory || "");
  const [selectedTools, setSelectedTools] = useState<string[]>(
    agent?.agent_tools || []
  );
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (agent) {
      setAgentName(agent.name);
      setRole(agent.role);
      setGoal(agent.goal);
      setBackstory(agent.backstory);
      setSelectedTools(agent.agent_tools);
    }
  }, [agent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsToolsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: agentName,
      role,
      goal,
      backstory,
      agent_tools: selectedTools,
    });
  };

  const handleToolToggle = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

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
      <div className="relative" ref={dropdownRef}>
        <Label>Agent Tools</Label>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
        >
          {selectedTools.length > 0
            ? `${selectedTools.length} tool${
                selectedTools.length > 1 ? "s" : ""
              } selected`
            : "Select tools"}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </Button>
        {isToolsDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg overflow-hidden">
            <div className="max-h-[50vh] overflow-y-auto">
              {isLoadingTools ? (
                <div className="p-4 text-center">Loading tools...</div>
              ) : (
                Object.keys(TOOL_CATEGORIES).map((category) => {
                  const categoryTools = availableTools.filter(
                    (tool) => tool.category === category
                  );
                  if (categoryTools.length === 0) return null;

                  return (
                    <div key={category} className="p-2">
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
            </div>
          </div>
        )}
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
              <XIcon className="h-4 w-4" />
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
