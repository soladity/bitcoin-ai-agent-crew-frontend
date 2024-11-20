"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Message, useChat } from "@/hooks/useChat";

interface Job {
  id: number;
  crew_id: number;
  messages: string[]; // Array of JSON strings
}

interface JobsViewProps {
  crewId: number;
}

export default function JobsView({ crewId }: JobsViewProps) {
  const { messages, isLoading, messagesEndRef } = useChat();
  const [jobs, setJobs] = useState<Job[]>([]);
  const { toast } = useToast();

  // // Parse JSON strings and flatten all job messages into a single messages array
  // const allMessages = jobs.flatMap((job) =>
  //   job.messages
  //     .map((messageStr) => {
  //       try {
  //         const parsedMessage: Message = JSON.parse(messageStr);
  //         return {
  //           ...parsedMessage,
  //           // Convert timestamp string to Date object for MessageBubble
  //           timestamp: new Date(parsedMessage.timestamp),
  //         };
  //       } catch (e) {
  //         console.error("Error parsing message:", e);
  //         return null;
  //       }
  //     })
  //     .filter(Boolean)
  // );

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
      }
    };

    fetchJobs();
  }, [crewId, toast]);

  return (
    <div className="">
      <div className="flex h-full">
        <div className="flex flex-col flex-1 h-auto overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 px-4 py-2">
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            {isLoading && (
              <div className="space-y-4 animate-pulse">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
