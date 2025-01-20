import {
  ScrollText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useJobs } from "@/hooks/use-jobs";
import { useProfile } from "@/hooks/use-profile";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MarkdownComponents } from "../chat/chat-message-bubble";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface JobsTableProps {
  agentId: string;
}

export function JobsTable({ agentId }: JobsTableProps) {
  const { user: profile } = useProfile();
  const { jobs, isLoading, error } = useJobs(agentId, profile?.id || "");

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Clock className="h-6 w-6 animate-pulse" />
            <p className="text-sm">Loading jobs...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load jobs: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-32">
          <ScrollText className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No jobs found</p>
        </div>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "failed":
        return <XCircle className="h-4 w-4" />;
      case "running":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium
                    ${
                      job.status === "failed"
                        ? "text-destructive"
                        : job.status === "running"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                >
                  {getStatusIcon(job.status)}
                  {job.status}
                </span>
                <Separator orientation="vertical" className="h-4" />
                <span className="font-mono text-xs text-muted-foreground">
                  {format(new Date(job.created_at), "PP p")}
                </span>
              </div>
            </div>

            {/* Task Name */}
            <div>
              <h3 className="text-sm font-medium leading-none">
                {job.task_name}
              </h3>
            </div>

            {/* Result */}
            <div className="rounded-lg bg-muted/50 p-4">
              {job.error ? (
                <span className="text-destructive text-sm">{job.error}</span>
              ) : job.result ? (
                <div className="text-sm text-muted-foreground prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {typeof job.result === "string"
                      ? job.result
                      : JSON.stringify(job.result, null, 2)}
                  </ReactMarkdown>
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
