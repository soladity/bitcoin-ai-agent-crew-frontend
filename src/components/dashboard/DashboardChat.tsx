"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

interface Crew {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setCrews] = useState<Crew[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCrews = async () => {
    const { data, error } = await supabase
      .from("crews")
      .select("id, name, description, created_at")
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
          data.map((crew) => `${crew.name}: ${crew.description}`).join("\n\n")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Mock response
      const response = await new Promise((resolve) =>
        setTimeout(
          () => resolve({ content: "Chat not implemented yet, coming soon!" }),
          1000
        )
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: (response as Message).content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
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
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
