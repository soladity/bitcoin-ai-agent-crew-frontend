"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Settings,
  PlusIcon,
  Trash2Icon,
  UserIcon,
  Globe,
  Lock,
  Edit,
  Clock,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import CrewForm from "./CrewForm";
import {
  CrewWithCron,
  CrewManagementProps,
  RawCrewData,
} from "@/types/supabase";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
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
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
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

  const handleDelete = async (id: number) => {
    setDeleteLoading(id);
    try {
      await supabase.from("jobs").delete().eq("crew_id", id);
      await supabase.from("tasks").delete().eq("crew_id", id);
      await supabase.from("agents").delete().eq("crew_id", id);
      await supabase.from("crons").delete().eq("crew_id", id);
      const { error } = await supabase.from("crews").delete().eq("id", id);

      if (error) throw error;

      const updatedCrews = crews.filter((crew) => crew.id !== id);
      setCrews(updatedCrews);
      onCrewUpdate(updatedCrews);

      toast({
        title: "Crew deleted",
        description:
          "The crew and all its associated data has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting crew:", error);
      toast({
        title: "Error",
        description: "Failed to delete the crew. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCrewCreated = (newCrew: CrewWithCron) => {
    const updatedCrews = editingCrew
      ? crews.map((c) => (c.id === newCrew.id ? newCrew : c))
      : [...crews, newCrew];
    setCrews(updatedCrews);
    onCrewUpdate(updatedCrews);
    setEditingCrew(null);
  };

  const handleCronToggle = async (crew: CrewWithCron) => {
    if (!crew.cron?.id) return;

    try {
      const newEnabled = !crew.cron.enabled;
      const { error } = await supabase
        .from("crons")
        .update({ enabled: newEnabled })
        .eq("id", crew.cron.id);

      if (error) throw error;

      const updatedCrews = crews.map((c) =>
        c.id === crew.id
          ? {
              ...c,
              cron: c.cron ? { ...c.cron, enabled: newEnabled } : null,
            }
          : c
      );

      setCrews(updatedCrews);
      onCrewUpdate(updatedCrews);

      toast({
        title: "Cron status updated",
        description: `Cron job has been ${
          newEnabled ? "enabled" : "disabled"
        }.`,
      });
    } catch (error) {
      console.error("Error updating cron status:", error);
      toast({
        title: "Error",
        description: "Failed to update cron status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublicToggle = async (crew: CrewWithCron) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("crews")
        .update({ is_public: !crew.is_public })
        .eq("id", crew.id)
        .select()
        .single();

      if (error) throw error;

      const updatedCrews = crews.map((c) =>
        c.id === crew.id ? { ...c, is_public: !c.is_public } : c
      );
      setCrews(updatedCrews);
      onCrewUpdate(updatedCrews);

      toast({
        title: "Visibility updated",
        description: `The crew is now ${
          data.is_public ? "public" : "private"
        }.`,
      });
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update crew visibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
              <DialogTitle>
                {editingCrew ? "Edit Crew" : "Create New Crew"}
              </DialogTitle>
            </DialogHeader>
            <CrewForm
              onCrewCreated={handleCrewCreated}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingCrew(null);
              }}
              editingCrew={editingCrew}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table className="min-w-full divide-y divide-gray-200">
        <TableHead className="hidden md:table-header-group">
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Description</TableHeader>
            <TableHeader>Created</TableHeader>
            <TableHeader>Public</TableHeader>
            <TableHeader>Run autonomously</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody className="block md:table-row-group">
          {crews.map((crew) => (
            <TableRow key={crew.id} className="block md:table-row mb-4 md:mb-0">
              <TableCell className="flex md:table-cell flex-col md:flex-row items-start md:items-center">
                <span className="font-bold md:hidden">Name:</span>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium text-sm">{crew.name}</span>
                </div>
              </TableCell>
              <TableCell className="flex md:table-cell flex-col md:flex-row items-start md:items-center max-w-auto truncate">
                {crew.description || "No description"}
              </TableCell>
              <TableCell className="flex md:table-cell flex-col md:flex-row items-start md:items-center">
                {new Date(crew.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex md:table-cell flex-col md:flex-row items-start md:items-center">
                <div className="flex items-center space-x-2">
                  {crew.is_public ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <Switch
                    checked={crew.is_public}
                    onCheckedChange={() => handlePublicToggle(crew)}
                    disabled={loading}
                  />
                </div>
              </TableCell>
              <TableCell className="flex md:table-cell flex-col md:flex-row items-start md:items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <Switch
                          checked={crew.cron ? crew.cron.enabled : false}
                          onCheckedChange={() => handleCronToggle(crew)}
                          disabled={loading}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Cron: {crew.cron ? crew.cron.input : "No cron"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="flex md:table-cell flex-col md:flex-row items-start md:items-center text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/crews/${crew.id}/manage`)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/crews/${crew.id}/execute`)}
                  >
                    <ChatBubbleIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingCrew(crew);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(crew.id)}
                    disabled={deleteLoading === crew.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deleteLoading === crew.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2Icon className="h-4 w-4" />
                    )}
                  </Button>
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
