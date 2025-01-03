import { useState, useEffect, useMemo } from "react";
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
import { Agent } from "@/types/supabase";
import { fetchTools, Tool } from "@/lib/tools";

interface AgentFormProps {
  formData: Partial<Agent>;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onToolsChange: (tools: string[]) => void;
}

export function AgentForm({
  formData,
  saving,
  onSubmit,
  onChange,
  onToolsChange,
}: AgentFormProps) {
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

  const handleToolToggle = (tool: string) => {
    const currentTools = formData.agent_tools || [];
    const newTools = currentTools.includes(tool)
      ? currentTools.filter((t) => t !== tool)
      : [...currentTools, tool];
    onToolsChange(newTools);
  };

  const filteredTools = availableTools.filter((tool) =>
    tool.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique categories and group tools by category
  const toolsByCategory = useMemo(() => {
    const categories = Array.from(new Set(filteredTools.map(tool => tool.category))).sort();
    return categories.reduce((acc, category) => {
      acc[category] = filteredTools.filter(tool => tool.category === category);
      return acc;
    }, {} as Record<string, Tool[]>);
  }, [filteredTools]);

  // Ensure agent_tools is always an array
  const selectedTools = Array.isArray(formData.agent_tools) ? formData.agent_tools : [];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          name="role"
          value={formData.role}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="goal">Goal</Label>
        <Textarea
          id="goal"
          name="goal"
          value={formData.goal}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="backstory">Backstory</Label>
        <Textarea
          id="backstory"
          name="backstory"
          value={formData.backstory}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={onChange}
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
                Object.entries(toolsByCategory).map(([category, tools]) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                      {category}
                    </h3>
                    {tools.map((tool) => (
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
                ))
              )}
            </ScrollArea>
            <div className="p-6 pt-2 border-t">
              <Button onClick={() => setIsToolDialogOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTools.map((tool) => {
          const toolInfo = availableTools.find(t => t.id === tool);
          return (
            <div
              key={tool}
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
            >
              {toolInfo?.name || tool}
              <button
                type="button"
                onClick={() => handleToolToggle(tool)}
                className="ml-2 text-primary-foreground hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Agent"}
      </Button>
    </form>
  );
}
