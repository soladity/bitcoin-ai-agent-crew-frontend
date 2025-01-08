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
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
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

  const filteredTools = availableTools.filter(
    (tool) =>
      tool.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toolsByCategory = useMemo(() => {
    const categories = Array.from(
      new Set(filteredTools.map((tool) => tool.category))
    ).sort();
    return categories.reduce((acc, category) => {
      acc[category] = filteredTools.filter(
        (tool) => tool.category === category
      );
      return acc;
    }, {} as Record<string, Tool[]>);
  }, [filteredTools]);

  const selectedTools = Array.isArray(formData.agent_tools)
    ? formData.agent_tools
    : [];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-xs font-medium text-zinc-400">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="mt-1.5 h-9 bg-black/20 border-zinc-800/40 text-sm"
          />
        </div>

        <div>
          <Label htmlFor="role" className="text-xs font-medium text-zinc-400">
            Role
          </Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={onChange}
            required
            className="mt-1.5 h-9 bg-black/20 border-zinc-800/40 text-sm"
          />
        </div>

        <div>
          <Label htmlFor="goal" className="text-xs font-medium text-zinc-400">
            Goal
          </Label>
          <Textarea
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={onChange}
            required
            className="mt-1.5 bg-black/20 border-zinc-800/40 text-sm min-h-[80px]"
          />
        </div>

        <div>
          <Label
            htmlFor="backstory"
            className="text-xs font-medium text-zinc-400"
          >
            Backstory
          </Label>
          <Textarea
            id="backstory"
            name="backstory"
            value={formData.backstory}
            onChange={onChange}
            required
            className="mt-1.5 bg-black/20 border-zinc-800/40 text-sm min-h-[80px]"
          />
        </div>

        <div>
          <Label
            htmlFor="image_url"
            className="text-xs font-medium text-zinc-400"
          >
            Image URL
          </Label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={onChange}
            className="mt-1.5 h-9 bg-black/20 border-zinc-800/40 text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs font-medium text-zinc-400 block mb-1.5">
          Agent Tools
        </Label>
        <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-9 bg-black/20 border-zinc-800/40 text-sm hover:bg-white/5"
            >
              {selectedTools.length > 0
                ? `${selectedTools.length} tool${
                    selectedTools.length > 1 ? "s" : ""
                  } selected`
                : "Select tools"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col p-0 bg-zinc-950 border-zinc-800/40">
            <DialogHeader className="px-4 py-3 border-b border-zinc-800/40">
              <DialogTitle className="text-sm font-medium">
                Select Tools
              </DialogTitle>
            </DialogHeader>
            <div className="flex-grow min-h-0">
              <ScrollArea className="h-full">
                <div className="px-4">
                  <div className="sticky top-0 bg-zinc-950 pt-4 pb-2 z-10">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-zinc-500" />
                      <Input
                        placeholder="Search tools..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 bg-black/20 border-zinc-800/40 text-sm"
                      />
                    </div>
                  </div>
                  {isLoadingTools ? (
                    <div className="p-4 text-center text-sm text-zinc-500">
                      Loading tools...
                    </div>
                  ) : (
                    Object.entries(toolsByCategory).map(([category, tools]) => (
                      <div key={category} className="mb-4">
                        <h3 className="text-xs font-medium text-zinc-500 mb-2">
                          {category}
                        </h3>
                        {tools.map((tool) => (
                          <div
                            key={tool.id}
                            className="flex items-start space-x-2 p-2 hover:bg-white/5 rounded-lg"
                          >
                            <Checkbox
                              id={tool.id}
                              checked={selectedTools.includes(tool.id)}
                              onCheckedChange={() => handleToolToggle(tool.id)}
                            />
                            <div className="flex flex-col">
                              <label
                                htmlFor={tool.id}
                                className="text-sm font-medium text-zinc-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {tool.name}
                              </label>
                              <p className="text-xs text-zinc-500 mt-1">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            <div className="p-4 pt-2 border-t border-zinc-800/40">
              <Button
                onClick={() => setIsToolDialogOpen(false)}
                className="h-8 bg-black/20 hover:bg-white/5 text-sm"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTools.map((tool) => {
            const toolInfo = availableTools.find((t) => t.id === tool);
            return (
              <div
                key={tool}
                className="bg-black/20 text-zinc-300 px-2 py-1 rounded text-xs flex items-center"
              >
                {toolInfo?.name || tool}
                <button
                  type="button"
                  onClick={() => handleToolToggle(tool)}
                  className="ml-1.5 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="w-full h-9 bg-black/20 hover:bg-white/5 text-sm mt-6"
      >
        {saving ? "Saving..." : "Save Agent"}
      </Button>
    </form>
  );
}
