import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

interface ClonePublicCrewProps {
  crewId: number;
}

export function ClonePublicCrew({ crewId }: ClonePublicCrewProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const cloneCrew = async () => {
    try {
      setLoading(true);

      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No user found");

      // Fetch the original crew
      const { data: originalCrew, error: crewError } = await supabase
        .from("crews")
        .select("*")
        .eq("id", crewId)
        .single();
      if (crewError) throw crewError;

      // Create new crew
      const { data: newCrew, error: newCrewError } = await supabase
        .from("crews")
        .insert({
          name: `${originalCrew.name} (Clone)`,
          description: originalCrew.description,
          is_public: false,
          profile_id: user.id,
        })
        .select()
        .single();
      if (newCrewError) throw newCrewError;

      // Fetch original agents
      const { data: originalAgents, error: agentsError } = await supabase
        .from("agents")
        .select("*")
        .eq("crew_id", crewId);
      if (agentsError) throw agentsError;

      // Clone agents
      if (originalAgents && originalAgents.length > 0) {
        const newAgents = originalAgents.map(agent => ({
          name: agent.name,
          role: agent.role,
          goal: agent.goal,
          crew_id: newCrew.id,
        }));

        const { error: newAgentsError } = await supabase
          .from("agents")
          .insert(newAgents);
        if (newAgentsError) throw newAgentsError;
      }

      // Fetch original tasks
      const { data: originalTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("crew_id", crewId);
      if (tasksError) throw tasksError;

      // Clone tasks
      if (originalTasks && originalTasks.length > 0) {
        const newTasks = originalTasks.map(task => ({
          description: task.description,
          crew_id: newCrew.id,
        }));

        const { error: newTasksError } = await supabase
          .from("tasks")
          .insert(newTasks);
        if (newTasksError) throw newTasksError;
      }

      toast({
        title: "Success!",
        description: "Crew cloned successfully.",
      });

      router.push(`/crews/${newCrew.id}`);
    } catch (error) {
      console.error("Error cloning crew:", error);
      toast({
        title: "Error",
        description: "Failed to clone crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Clone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone Crew</DialogTitle>
          <DialogDescription>
            This will create a copy of the crew with all its agents and tasks.
            The new crew will be private by default.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={cloneCrew} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cloning...
              </>
            ) : (
              "Clone"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
