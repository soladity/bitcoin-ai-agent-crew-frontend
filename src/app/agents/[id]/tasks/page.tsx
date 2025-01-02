"use client";

import { TasksTable } from "@/components/tasks/tasks";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { TaskEditModal } from "@/components/tasks/task-edit-modal";
import { Heading } from "@/components/catalyst/heading";
import { useParams } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";

export const runtime = 'edge';

export default function AgentTasksPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams();
  const agentId = params.id as string;
  const { user: profileId } = useProfile();

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Tasks</Heading>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskEditModal
              task={null}
              open={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              agentId={agentId}
              profileId={profileId?.id || ""}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        <TasksTable agentId={agentId} />
      </div>
    </div>
  );
}
