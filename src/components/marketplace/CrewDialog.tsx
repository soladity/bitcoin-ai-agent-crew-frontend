"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, CheckSquare } from "lucide-react";
import { ClonePublicCrew } from "@/components/marketplace/ClonePublicCrew";
import type { PublicCrew } from "@/types/supabase";

interface CrewDialogProps {
  crew: PublicCrew;
}

export function CrewDialog({ crew }: CrewDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{crew.name}</DialogTitle>
          <DialogDescription>{crew.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] w-full pr-4">
          {crew.agents?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {crew.agents.map((agent) => (
                <Card key={agent.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                    </div>
                    <CardDescription className="mt-1.5">
                      {agent.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm mb-4">
                      <span className="text-muted-foreground">Goal: </span>
                      {agent.goal}
                    </div>
                    {agent.tasks?.length ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <CheckSquare className="w-3.5 h-3.5" />
                          TASKS
                        </div>
                        <ul className="space-y-2 text-sm">
                          {agent.tasks.map((task, index) => (
                            <li
                              key={index}
                              className="p-2 rounded-sm bg-muted/50"
                            >
                              {task.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No agents defined
            </div>
          )}
        </ScrollArea>
        <div className="flex justify-end pt-4">
          <ClonePublicCrew crew={crew} disabled={false} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
