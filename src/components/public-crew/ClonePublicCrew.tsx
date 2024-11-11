"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import type { PublicCrew } from "@/types/supabase";

interface ClonePublicCrewProps {
  crew: PublicCrew;
  onCloneComplete: () => void;
  disabled: boolean;
}

export function ClonePublicCrew({
  crew,
  onCloneComplete,
  disabled,
}: ClonePublicCrewProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCloned, setHasCloned] = useState(false);

  const clonePublicCrew = async () => {
    if (hasCloned) {
      setError("This crew has already been cloned.");
      return;
    }

    setIsCloning(true);
    setError(null);

    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) {
        throw new Error("No authenticated user found");
      }

      // Create crew
      const { data: clonedCrew, error: crewError } = await supabase
        .from("crews")
        .insert({
          name: `${crew.name} (Cloned)`,
          description: crew.description,
          profile_id: profile.user.id,
        })
        .select()
        .single();

      if (crewError || !clonedCrew) {
        throw new Error("Failed to clone crew");
      }

      // Clone agents and their tasks
      for (const agent of crew.agents) {
        const { data: clonedAgent, error: agentError } = await supabase
          .from("agents")
          .insert({
            name: agent.name,
            role: agent.role,
            goal: agent.goal,
            backstory: agent.backstory,
            agent_tools: agent.agent_tools,
            crew_id: clonedCrew.id,
            profile_id: profile.user.id,
          })
          .select()
          .single();

        if (agentError || !clonedAgent) {
          console.error("Error cloning agent:", agentError);
          continue;
        }

        // Clone tasks for agent
        for (const task of agent.tasks) {
          const { error: taskError } = await supabase.from("tasks").insert({
            description: task.description,
            expected_output: task.expected_output,
            agent_id: clonedAgent.id,
            crew_id: clonedCrew.id,
            profile_id: profile.user.id,
          });

          if (taskError) {
            console.error("Error cloning task:", taskError);
          }
        }
      }

      setHasCloned(true);
      onCloneComplete();
      toast({
        title: "Success",
        description: `You've successfully cloned the "${crew.name}" crew. You can find it in your crews list.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={clonePublicCrew}
        disabled={isCloning || hasCloned || disabled}
        variant="outline"
        className="w-full"
      >
        {isCloning ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
            <span>Cloning Crew...</span>
          </div>
        ) : hasCloned ? (
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Crew Cloned</span>
          </div>
        ) : (
          "Clone Crew"
        )}
      </Button>
    </div>
  );
}
