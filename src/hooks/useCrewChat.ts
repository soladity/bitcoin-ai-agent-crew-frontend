import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";

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
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const currentJobRef = useRef<{
    steps: Message[];
    tasks: Message[];
    results: Message[];
  }>({
    steps: [],
    tasks: [],
    results: [],
  });

  const scrollToBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const handleResetHistory = useCallback(async () => {
    if (!authToken || !crewId) return;

    try {
      setIsLoading(true);

      // Close existing WebSocket connection if any
      if (ws) {
        await new Promise<void>((resolve) => {
          const closeHandler = () => {
            console.log("WebSocket closed during reset");
            resolve();
          };

          if (ws.readyState === WebSocket.CLOSED) {
            resolve();
          } else {
            ws.addEventListener('close', closeHandler, { once: true });
            ws.close();
          }
        });
        setWs(null);
      }

      setMessages([]);
      setIsLoading(false);

      toast({
        title: "Success",
        description: "Chat history has been reset.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to reset chat history:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to reset chat history.",
        variant: "destructive",
      });
    }
  }, [authToken, crewId, ws, toast]);

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

  // Set up WebSocket connection when we have auth token and crew ID
  useEffect(() => {
    if (!authToken || !crewId || ws) return;

    const wsUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/crew/${crewId}/ws`);
    wsUrl.searchParams.append('token', authToken);

    const newWs = new WebSocket(wsUrl.toString());

    newWs.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setIsLoading(false);
    };

    newWs.onmessage = (event) => {
      try {
        if (!event.data || event.data.trim() === "") return;

        const data = JSON.parse(event.data);
        if (!data || typeof data !== "object") return;

        console.log('Received message:', data); // Debug log

        switch (data.type) {
          case 'history':
            // Set initial conversation history
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
            const historyMessages = data.messages.map((msg: any) => {
              const timestamp = msg.timestamp || msg.created_at || msg.job_started_at || new Date().toISOString();
              return {
                role: msg.role,
                type: msg.type,
                content: msg.content,
                timestamp: new Date(timestamp),
              };
            });
            historyMessages.sort((a: { timestamp: { getTime: () => number; }; }, b: { timestamp: { getTime: () => number; }; }) => a.timestamp.getTime() - b.timestamp.getTime());
            setMessages(historyMessages);
            break;

          case 'job_started':
            console.log('New job started:', data.job_id);
            // Reset the current job's message groups when a new job starts
            currentJobRef.current = {
              steps: [],
              tasks: [],
              results: [],
            };
            break;

          case 'step':
            const stepMessage: Message = {
              role: "assistant",
              type: "step",
              content: data.content,
              timestamp: new Date(),
            };
            // Add step message immediately to the chat
            setMessages((prev) => [...prev, stepMessage]);
            break;

          case 'task':
            const taskMessage: Message = {
              role: "assistant",
              type: "task",
              content: data.content,
              timestamp: new Date(),
            };
            // Add task message immediately to the chat
            setMessages((prev) => [...prev, taskMessage]);
            break;

          case 'result':
            const resultMessage: Message = {
              role: "assistant",
              type: "result",
              content: data.content,
              timestamp: new Date(),
            };
            // Add result message to the chat
            setMessages((prev) => [...prev, resultMessage]);
            setIsLoading(false); // Allow next message after result
            break;

          case 'error':
            console.error('WebSocket error:', data.error);
            toast({
              title: "Error",
              description: data.error || "An error occurred",
              variant: "destructive",
            });
            setIsLoading(false); // Allow retry after error
            break;

          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        setIsLoading(false); // Allow retry after error
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Error",
        description: "Connection error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setWs(null);
    };

    setWs(newWs);

    return () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, crewId, toast]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !crewId || !ws || ws.readyState !== WebSocket.OPEN) return;

    const userMessage: Message = {
      role: "user",
      type: null,
      content: input,
      timestamp: new Date(),
    };

    try {
      // Send message through WebSocket
      ws.send(JSON.stringify({
        type: "chat_message",
        message: input
      }));

      // Add user message to chat
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  }, [input, isLoading, crewId, ws, toast]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    handleResetHistory,
    messagesEndRef,
    setCrewId,
    isConnected,
  };
}