"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Crew } from "@/types/supabase";
import { ApiResponse } from "@/components/dashboard/Execution";
import { RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokenUsage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    successful_requests: number;
  };
}

export default function DashboardChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const scrollToBottom = () => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const fetchCrews = async () => {
    const { data, error } = await supabase
      .from("crews")
      .select(
        "id, name, description, created_at, agents(id, name, role), tasks(id, name, description)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching crews:", error);
      return;
    }

    setCrews(data || []);

    // Add initial assistant message
    const message =
      data && data.length > 0
        ? "# Your Crews\n\n" +
          data.map((crew) => `${crew.name}: ${crew.description}`).join("\n\n") +
          "\n\nPlease select a crew to start chatting."
        : "Welcome! To get started, click the 'Clone Trading Analyzer' button below to create your first crew with pre-configured agents and tasks.";

    const initialMessage: Message = {
      role: "assistant",
      content: message,
      timestamp: new Date(),
    };

    setMessages([initialMessage]);
  };

  useEffect(() => {
    fetchCrews();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setAuthToken(session.access_token);
      }
    };

    getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedCrew) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const requestBody = `# Current Input\n${input}\n\n# Conversation History\n${messages
        .map((m) => `${m.role.toUpperCase()} (${m.timestamp}): ${m.content}`)
        .join("\n\n")}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/execute_crew/${selectedCrew.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.result.raw || `HTTP error! status: ${response.status}`
        );
      }
      const assistantMessage: Message = {
        role: "assistant",
        content: data.result.raw,
        timestamp: new Date(),
        tokenUsage: data.result.token_usage,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefetchCrews = async () => {
    await fetchCrews();
    toast({
      title: "Crews Refreshed",
      description: "The list of crews has been updated.",
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center space-x-2">
          <Select
            onValueChange={(value) => {
              const crew = crews.find((c) => c.id.toString() === value);
              setSelectedCrew(crew || null);
              if (crew) {
                console.log("Selected Crew:", {
                  id: crew.id,
                  name: crew.name,
                  description: crew.description,
                  created_at: crew.created_at,
                });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a crew to chat with" />
            </SelectTrigger>
            <SelectContent>
              {crews.map((crew) => (
                <SelectItem key={crew.id} value={crew.id.toString()}>
                  {crew.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefetchCrews}
            title="Refresh crews"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-[300px] overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-4"
                    : "bg-muted"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
                {message.tokenUsage && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Token usage: {message.tokenUsage.total_tokens}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedCrew
                ? "Type your message..."
                : "Select a crew to start chatting"
            }
            disabled={isLoading || !selectedCrew}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !selectedCrew}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
