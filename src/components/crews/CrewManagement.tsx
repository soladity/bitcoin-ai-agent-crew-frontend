"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PlusIcon,
  Trash2Icon,
  UserIcon,
  Settings,
  Globe,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import CrewForm from "./CrewForm";
import { Crew, CrewManagementProps } from "@/types/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CrewManagement({
  initialCrews,
  onCrewSelect,
  onCrewUpdate,
  selectedCrew,
}: CrewManagementProps) {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await supabase.from("tasks").delete().eq("crew_id", id);
      await supabase.from("agents").delete().eq("crew_id", id);
      await supabase.from("crews").delete().eq("id", id);

      const updatedCrews = crews.filter((crew) => crew.id !== id);
      setCrews(updatedCrews);

      if (selectedCrew?.id === id) {
        onCrewSelect(null);
      }

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
      setLoading(false);
    }
  };

  const handleCrewCreated = (newCrew: Crew) => {
    const updatedCrews = [...crews, newCrew];
    setCrews(updatedCrews);
    onCrewUpdate(updatedCrews);
  };

  const handlePublicToggle = async (crew: Crew) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("crews")
        .update({ is_public: !crew.is_public })
        .eq("id", crew.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedCrews = crews.map((c) =>
          c.id === crew.id ? { ...c, is_public: data.is_public } : c
        );
        setCrews(updatedCrews);
        onCrewUpdate(updatedCrews);

        toast({
          title: "Crew updated",
          description: `The crew is now ${
            data.is_public
              ? "public. Everyone can see your crew and clone it."
              : "private. Only you can see it."
          }.`,
        });
      }
    } catch (error) {
      console.error("Error updating crew:", error);
      toast({
        title: "Error",
        description: "Failed to update the crew. Please try again.",
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
            <Button size="sm" variant="outline">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Crew
            </Button>
          </DialogTrigger>
          <DialogContent>
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
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-2">
          {crews.map((crew) => (
            <div
              key={crew.id}
              className="flex flex-col space-y-2 p-3 border rounded-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{crew.name}</span>
                </div>
                <Button
                  variant={selectedCrew?.id === crew.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onCrewSelect(crew)}
                >
                  {selectedCrew?.id === crew.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {crew.description || "No description"}
              </p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  Created: {new Date(crew.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {crew.is_public ? (
                      <Globe className="h-3 w-3" />
                    ) : (
                      <Lock className="h-3 w-3" />
                    )}
                    <Switch
                      checked={crew.is_public}
                      onCheckedChange={() => handlePublicToggle(crew)}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/crew/${crew.id}/manage`)}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(crew.id)}
                    disabled={loading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default CrewManagement;
