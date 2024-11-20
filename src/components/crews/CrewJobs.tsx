"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Heading } from "../catalyst/heading";
import { Card, CardContent } from "@/components/ui/card";

interface Job {
  id: number;
  crew_id: number;
  messages: any[];
}

interface JobsViewProps {
  crewId: number;
}

export default function JobsView({ crewId }: JobsViewProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to view jobs.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("jobs")
          .select("id, crew_id, messages")
          .eq("crew_id", crewId)
          .order("id", { ascending: false });

        if (error) throw error;

        setJobs(data || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast({
          title: "Error",
          description: "Failed to fetch jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [crewId, toast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Heading className="mb-6">Job History for Crew {crewId}</Heading>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-center text-gray-500">
              No jobs available for this crew.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Messages</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.id}</TableCell>
                <TableCell>
                  <div className="max-h-40 overflow-y-auto">{job.messages}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
