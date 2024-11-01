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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Trash2Icon, UserIcon, Settings, Check, CheckCircle2 } from "lucide-react";
import CrewForm from "./CrewForm";
import { Crew } from "@/types/supabase";

interface CrewManagementProps {
  crews: Crew[];
  onCrewSelect: (crew: Crew | null) => void;
  onCrewUpdate: () => void;
  selectedCrew: Crew | null;
}

export function CrewManagement({ 
  crews,
  onCrewSelect,
  onCrewUpdate,
  selectedCrew,
}: CrewManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      // First delete all tasks associated with the crew
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("crew_id", id);

      if (tasksError) throw tasksError;

      // Then delete all agents associated with the crew
      const { error: agentsError } = await supabase
        .from("agents")
        .delete()
        .eq("crew_id", id);

      if (agentsError) throw agentsError;

      // Finally delete the crew itself
      const { error: crewError } = await supabase
        .from("crews")
        .delete()
        .eq("id", id);

      if (crewError) throw crewError;

      // Clear selected crew if we're deleting it
      if (selectedCrew?.id === id) {
        onCrewSelect(null);
      }
      
      onCrewUpdate();
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Crews</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Crew
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Crew</DialogTitle>
            </DialogHeader>
            <CrewForm
              onCrewCreated={onCrewUpdate}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crews.map((crew) => (
              <TableRow key={crew.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    <span>{crew.name}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {crew.description || "No description"}
                </TableCell>
                <TableCell>
                  {new Date(crew.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCrew?.id === crew.id ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onCrewSelect(crew)}
                      className="min-w-[100px]"
                    >
                      {selectedCrew?.id === crew.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Select
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/crew/${crew.id}/manage`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(crew.id)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
