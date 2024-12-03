"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  Globe,
  Lock,
  Clock,
  Settings2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CrewForm from "./CrewForm";
import {
  CrewWithCron,
  CrewManagementProps,
  RawCrewData,
} from "@/types/supabase";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heading } from "../catalyst/heading";

export function CrewManagement({
  initialCrews,
  onCrewUpdate,
}: CrewManagementProps) {
  const [crews, setCrews] = useState<CrewWithCron[]>(initialCrews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewWithCron | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchCrewsWithCrons = async () => {
      try {
        // retrieves data from the "crews" table, along with related data from the "crons" table.
        const { data: crewsData, error: crewsError } = await supabase.from(
          "crews"
        ).select(`*,
            crons (
              id,
              enabled,
              input,
              created_at
            )
          `);

        if (crewsError) throw crewsError;

        const processedCrews: CrewWithCron[] = crewsData.map(
          (crew: RawCrewData) => ({
            id: crew.id,
            name: crew.name,
            description: crew.description,
            created_at: crew.created_at,
            is_public: crew.is_public,
            profile_id: crew.profile_id,
            cron: crew.crons?.[0] || null,
          })
        );

        setCrews(processedCrews);
        onCrewUpdate(processedCrews);
      } catch (error) {
        console.error("Error fetching crews:", error);
        toast({
          title: "Error",
          description: "Failed to fetch crews. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchCrewsWithCrons();
  }, [onCrewUpdate, toast]);

  const handleCrewCreated = (newCrew: CrewWithCron) => {
    const updatedCrews = editingCrew
      ? crews.map((c) => (c.id === newCrew.id ? newCrew : c))
      : [...crews, newCrew];
    setCrews(updatedCrews);
    onCrewUpdate(updatedCrews);
    setEditingCrew(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Your Crews</Heading>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCrew(null)}>
              <PlusIcon className="h-4 w-4 mr-2" /> Add Crew
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Crew</DialogTitle>
            </DialogHeader>
            <CrewForm
              onCrewCreated={handleCrewCreated}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6">
        {/* Desktop view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead className="w-full">Description</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crews.map((crew) => (
                <TableRow key={crew.id}>
                  <TableCell className="font-medium">
                    {crew.name}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {crew.description || "No description"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {crew.is_public ? (
                              <Globe className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{crew.is_public ? "Public" : "Private"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {crew.cron?.enabled && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cron Enabled</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/crews/${crew.id}/manage`)}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile view */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {crews.map((crew) => (
            <div
              key={crew.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{crew.name}</h3>
                  <div className="flex items-center gap-2">
                    {crew.is_public ? (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    {crew.cron?.enabled && (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {crew.description || "No description"}
                </p>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => router.push(`/crews/${crew.id}/manage`)}
                    className="w-full"
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Manage Crew
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CrewManagement;
