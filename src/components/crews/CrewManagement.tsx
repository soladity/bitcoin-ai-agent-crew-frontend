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
} from "@/components/catalyst/table";
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
            crons: crew.crons?.[0] || null,
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
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-b border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Your Crews</Heading>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="flex gap-4">
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCrew(null)}>
                <PlusIcon className="h-4 w-4 mr-2" /> Add Crew
              </Button>
            </DialogTrigger>
          </div>

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

      <Table className="min-w-full divide-y divide-gray-200">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader className="w-24">Status</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {crews.map((crew) => (
            <TableRow 
              key={crew.id} 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => router.push(`/crews/${crew.id}/manage`)}
            >
              <TableCell>
                <div className="font-medium">{crew.name}</div>
              </TableCell>
              <TableCell className="max-w-md truncate">
                {crew.description || "No description"}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {crew.is_public ? (
                          <Globe className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-500" />
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        {crew.is_public ? "Public" : "Private"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Clock className={`h-4 w-4 ${crew.cron?.enabled ? 'text-green-500' : 'text-gray-500'}`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        {crew.cron?.enabled ? "Cron Enabled" : "Cron Disabled"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default CrewManagement;
