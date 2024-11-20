"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  type?: "step" | "task" | "result" | "user";
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Job {
  id: number;
  crew_id: number;
  messages: string[];
}

interface JobsViewProps {
  crewId: number;
}

export default function JobsView({ crewId }: JobsViewProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const parseMessage = (messageStr: string) => {
    try {
      return JSON.parse(messageStr);
    } catch (e) {
      console.error("Error parsing message:", e);
      return null;
    }
  };

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;

    return jobs.filter((job) => {
      const parsedMessages = job.messages
        .map(parseMessage)
        .filter(Boolean) as Message[];

      return parsedMessages.some((message) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [jobs, searchTerm]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="sticky top-0 z-10 pt-2 pb-4 backdrop-blur-md">
        <h1 className="text-2xl font-bold mb-2">Job History (Crew {crewId})</h1>
        <Input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <p>No jobs found matching your search.</p>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="w-full">
              <CardHeader>
                <CardTitle>Job #{job.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {job.messages
                  .map(parseMessage)
                  .filter(Boolean)
                  .filter(
                    (message) =>
                      !searchTerm ||
                      message.content
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                  )
                  .map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.type === "step"
                          ? "bg-primary text-primary-foreground"
                          : message.type === "task"
                          ? "bg-gray-900"
                          : message.type === "result"
                          ? "bg-secondary"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.type?.toUpperCase()}
                      </div>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="text-sm prose prose-sm"
                      >
                        {message.content}
                      </ReactMarkdown>
                      <div className="text-xs mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
