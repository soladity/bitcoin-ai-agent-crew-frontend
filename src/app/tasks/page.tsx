"use client";

import { TasksTable } from "@/components/tasks/TasksTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/16/solid";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { TaskEditModal } from "@/components/tasks/TaskEditModal";
import { Heading } from "@/components/catalyst/heading";

export default function TasksPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        <TasksTable />
      </div>
    </div>
  );
}
