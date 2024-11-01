"use client";

import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon, Trash2Icon, UserIcon, Edit2Icon } from "lucide-react";
import CrewForm from "./CrewForm";
import { CrewManagementProps } from "@/types/supabase";

export function CrewManagement({
  crews,
  onCrewSelect,
  onCrewUpdate,
}: CrewManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
                      variant="outline"
                      size="sm"
                      onClick={() => onCrewSelect(crew)}
                    >
                      <Edit2Icon className="h-4 w-4 mr-2" />
                      Edit
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
import { Button } from "@/components/ui/button";

interface CrewManagementProps {
  crews: Crew[];
  onCrewSelect: (crew: Crew) => void;
  onCrewUpdate: () => void;
  selectedCrew: Crew | null;
}

export function CrewManagement({ crews, onCrewSelect, onCrewUpdate, selectedCrew }: CrewManagementProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {crews.map((crew) => (
              <tr key={crew.id} className="border-b">
                <td className="p-2">{crew.name}</td>
                <td className="p-2">{crew.description}</td>
                <td className="p-2">
                  {new Date(crew.created_at).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <Button
                      variant={selectedCrew?.id === crew.id ? "secondary" : "outline"}
                      onClick={() => onCrewSelect(crew)}
                    >
                      {selectedCrew?.id === crew.id ? "Selected" : "Select"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = `/crew/${crew.id}`}
                    >
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
