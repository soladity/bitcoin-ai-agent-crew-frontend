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

export default function PublicCrews() {
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
    return <div className="text-center p-4">Loading crews...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (crews.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
          <Heading>Marketplace</Heading>
          <div className="flex gap-4"></div>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-40">
            <p className="text-lg text-muted-foreground">
              No crews available at this time.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Marketplace</Heading>
        <div className="flex gap-4"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crews.map((crew) => (
          <Card key={crew.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {crew.name}
              </CardTitle>
              <CardDescription>{crew.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Created: {new Date(crew.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Creator:{" "}
                <a
                  href={`https://explorer.hiro.so/address/${crew.creator_email}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  {crew.creator_email}
                </a>
              </p>
              <h3 className="font-semibold mb-2">Agents:</h3>
              <ul className="space-y-2">
                {crew.agents.map((agent) => (
                  <li key={agent.id}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {agent.name}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                          <DialogTitle>{agent.name}</DialogTitle>
                          <DialogDescription>{agent.role}</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-grow">
                          <div className="space-y-4 p-4">
                            <div>
                              <h4 className="font-semibold">Goal</h4>
                              <p>{agent.goal}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Backstory</h4>
                              <p>{agent.backstory}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold">Tools</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {agent.agent_tools.map((tool, index) => (
                                  <Badge key={index} variant="secondary">
                                    <PenTool className="h-3 w-3 mr-1" />
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold">Tasks</h4>
                              <ul className="space-y-2 mt-1">
                                {agent.tasks.map((task) => (
                                  <li
                                    key={task.id}
                                    className="bg-muted p-2 rounded-md"
                                  >
                                    <p className="font-medium flex items-center gap-2">
                                      <CheckSquare className="h-4 w-4" />
                                      {task.description}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Expected output: {task.expected_output}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <ClonePublicCrew crew={crew} disabled={false} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
