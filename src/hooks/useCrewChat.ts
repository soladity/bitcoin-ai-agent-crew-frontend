import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import * as Sentry from "@sentry/nextjs";

export interface Message {
  role: "user" | "assistant";
  type: "task" | "step" | "result" | null;
  content: string;
  timestamp: Date;
}

export function useCrewChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [crewId, setCrewId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const handleResetHistory = useCallback(async () => {
    if (!authToken) return;

    try {
      setMessages([]);
      toast({
        title: "Success",
        description: "Chat history has been reset.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to reset chat history:", error);
      Sentry.captureException(error);
      toast({
        title: "Error",
        description: "Failed to reset chat history.",
        variant: "destructive",
      });
    }
  }, [authToken, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthToken(session.access_token);
      }
    };

    getSession();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !crewId) return;

    const userMessage: Message = {
      role: "user",
      type: null, 
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const tokenResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crew/${crewId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(input),
        }
      );

      if (!tokenResponse.ok) {
        throw new Error(`HTTP error! status: ${tokenResponse.status}`);
      }

      const { job_id } = await tokenResponse.json();

      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/crew/jobs/${job_id}/stream`
      );

      eventSource.onmessage = (event) => {
        try {
          if (!event.data || event.data.trim() === "") return;

          const data = JSON.parse(event.data);
          if (!data || typeof data !== "object") return;

          switch (data.type) {
            case "step":
            case "task":
            case "result":
              setMessages((prev) => [
                ...prev,
                { role: "assistant", type: data.type, content: data.content, timestamp: new Date(data.timestamp) },
              ]);
              break;
            default:
              console.warn("Unknown message type:", data.type);
          }

          if (data.type === "result") {
            eventSource.close();
            setIsLoading(false);
          }
        } catch (error) {
          Sentry.captureException(error);
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.addEventListener("error", (event: MessageEvent) => {
        const errorData = JSON.parse(event.data);
        console.error("Received server error:", errorData.message);
      
        toast({
          title: "Server Error",
          description: errorData.message,
          variant: "destructive",
        });
      
        Sentry.captureException(new Error(errorData.message));
        eventSource.close();
        setIsLoading(false);
      });

      eventSource.onerror = (error: Event) => {
        console.error("EventSource encountered a generic error:", error);
        toast({
          title: "Connection Error",
          description: "A connection error occurred. Please try again.",
          variant: "destructive",
        });

        Sentry.captureException(error);
        setIsLoading(false);
      };

      eventSource.addEventListener("finish", () => {
        eventSource.close();
        setIsLoading(false);

        const assistantMessage: Message = {
          role: "assistant",
          type: null,
          content: "Task completed",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [authToken, input, isLoading, toast, crewId]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    messagesEndRef,
    handleResetHistory,
    setCrewId
  };
}