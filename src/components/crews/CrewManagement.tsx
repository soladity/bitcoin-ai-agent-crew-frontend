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
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">Your Crews</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingCrew(null)}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Crew
            </Button>
          </DialogTrigger>
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

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Created</TableHeader>
              <TableHeader>Public</TableHeader>
              <TableHeader>Run autonomusly</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {crews.map((crew) => (
              <TableRow key={crew.id}>
                <TableCell>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-primary mr-2" />
                    <span className="font-medium text-sm">{crew.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {crew.description || "No description"}
                </TableCell>
                <TableCell>
                  {new Date(crew.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
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
                <TableCell>
                  {crew.cron && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <Switch
                              checked={crew.cron.enabled}
                              onCheckedChange={() => handleCronToggle(crew)}
                              disabled={loading}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Cron: {crew.cron.input}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
                <TableCell className="text-right">
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
      </ScrollArea>
    </div>
  );
}

export default CrewManagement;
