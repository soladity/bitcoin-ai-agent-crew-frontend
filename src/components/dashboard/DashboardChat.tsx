"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import { Crew } from "@/types/supabase";

interface DashboardChatProps {
  selectedCrew: Crew | null;
}

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

export default function DashboardChat({ selectedCrew }: DashboardChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState("");

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

  useEffect(() => {
    const initialMessage: Message = {
      role: "assistant",
      content: selectedCrew
        ? `# Selected: ${selectedCrew.name}\n\n${selectedCrew.description}\n\nHow can I help you today?`
        : "Please select a crew to start chatting.",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, [selectedCrew]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

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
    setStreamingMessage("");

    try {
      const requestBody = `# Current Input\n${input}\n\n# Conversation History\n${messages
        .map((m) => `${m.role.toUpperCase()} (${m.timestamp}): ${m.content}`)
        .join("\n\n")}`;

      // Get a connection token
      const tokenResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!tokenResponse.ok) {
        throw new Error(`HTTP error! status: ${tokenResponse.status}`);
      }

      const { connection_token } = await tokenResponse.json();

      // Start SSE connection
      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/sse/execute_crew/${selectedCrew.id}?connection_token=${connection_token}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "step":
            case "task":
              setStreamingMessage((prev) => prev + `${data.content}\n\n`);
              break;
            case "result":
              setStreamingMessage((prev) => prev + data.content);
              break;
            default:
              console.warn("Unknown message type:", data.type);
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
          setStreamingMessage((prev) => prev + event.data + "\n");
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource failed:", error);
        eventSource.close();
        setIsLoading(false);
      };

      eventSource.addEventListener("close", () => {
        eventSource.close();
        setIsLoading(false);

        const assistantMessage: Message = {
          role: "assistant",
          content: streamingMessage.trim(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingMessage("");
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4">
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
          {streamingMessage && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg bg-muted">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streamingMessage}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {isLoading && !streamingMessage && (
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
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
