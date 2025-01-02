import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Agent } from "@/types/supabase";

interface AgentFormProps {
  formData: Partial<Agent>;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onToolsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AgentForm({
  formData,
  saving,
  onSubmit,
  onChange,
  onToolsChange,
}: AgentFormProps) {
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
        <Label htmlFor="tools">Tools (comma-separated)</Label>
        <Input
          id="tools"
          name="tools"
          value={formData.agent_tools}
          onChange={onToolsChange}
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Agent"}
      </Button>
    </form>
  );
}
