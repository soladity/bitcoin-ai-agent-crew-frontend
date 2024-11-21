"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Users, User, CheckSquare, PenTool } from "lucide-react";
import type { PublicCrew } from "@/types/supabase";
import { ClonePublicCrew } from "./ClonePublicCrew";
import { Heading } from "../catalyst/heading";
import { Loader } from "../reusables/Loader";

export default function Marketplace() {
  const [crews, setCrews] = useState<PublicCrew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public-crews`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch crews");
        }
        const data = await response.json();
        setCrews(data);
      } catch (error: unknown) {
        setError("Failed to load crews. Please try again later.");
        console.error("Error fetching crews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrews();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Heading>Marketplace </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {crews.map((crew) => (
          <Card key={crew.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">{crew.name}</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  <Users className="w-3 h-3 mr-1" />
                  {crew.members?.length || 0}
                </Badge>
              </div>
              <CardDescription>{crew.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Created By</h4>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span className="text-sm">{crew.creator_email}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {crew.agents?.reduce((count, agent) => count + (agent.tasks?.length || 0), 0) || 0} Tasks
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {crew.agents?.length || 0} Agents
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Dialog>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
