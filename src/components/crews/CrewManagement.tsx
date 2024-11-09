"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
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
  Check,
  CheckCircle2,
} from "lucide-react";
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
              className="flex flex-col space-y-2 p-3 border rounded-md "
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
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
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
                <div className="flex space-x-1">
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
