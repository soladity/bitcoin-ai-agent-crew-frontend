"use client";

import React, { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  ListChecks,
  Trash2,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOverview = pathname === `/agents/${id}`;
  const isTasks = pathname === `/agents/${id}/tasks`;
  const isJobs = pathname === `/agents/${id}/logs`;

  const handleDelete = async () => {
    try {
      // First delete all tasks associated with this agent
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("agent_id", id);

      if (tasksError) throw tasksError;

      // Then delete the agent
      const { error: agentError } = await supabase
        .from("agents")
        .delete()
        .eq("id", id);

      if (agentError) throw agentError;

      toast({
        title: "Success",
        description: "Agent and associated tasks deleted successfully",
      });

      router.push("/agents");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 space-y-4">
        {/* Breadcrumb and Delete */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link
              href="/agents"
              className="hover:text-foreground transition-colors"
            >
              Agents
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium">Details</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          <Link href={`/agents/${id}`} className="mr-6">
            <div
              className={`flex items-center gap-2 pb-2 ${
                isOverview
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Overview</span>
            </div>
          </Link>
          <Link href={`/agents/${id}/tasks`} className="mr-6">
            <div
              className={`flex items-center gap-2 pb-2 ${
                isTasks
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListChecks className="h-4 w-4" />
              <span className="text-sm font-medium">Tasks</span>
            </div>
          </Link>
          <Link href={`/agents/${id}/jobs`} className="mr-6">
            <div
              className={`flex items-center gap-2 pb-2 ${
                isJobs
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PlayCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Jobs</span>
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="pt-2">{children}</div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              agent and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
