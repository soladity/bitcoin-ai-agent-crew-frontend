"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollText } from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import { useProfile } from "@/hooks/use-profile";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface JobsTableProps {
  agentId: string;
}

export function JobsTable({ agentId }: JobsTableProps) {
  const { user: profile } = useProfile();
  const { jobs, isLoading, error } = useJobs(agentId, profile?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-zinc-500">
        Loading jobs...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load jobs: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-sm text-zinc-500">
        <ScrollText className="h-8 w-8 mb-2 text-zinc-400" />
        <p>No jobs found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Result/Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>{format(new Date(job.created_at), "PPpp")}</TableCell>
              <TableCell>{job.task_name}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    job.status === "failed"
                      ? "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-400"
                      : job.status === "running"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-400"
                      : "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400"
                  }`}
                >
                  {job.status}
                </span>
              </TableCell>
              <TableCell>
                {job.error ? (
                  <span className="text-red-500">{job.error}</span>
                ) : job.result ? (
                  <span className="text-zinc-500">
                    {typeof job.result === "string"
                      ? job.result
                      : JSON.stringify(job.result)}
                  </span>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
