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

interface Job {
  id: number;
  created_at: string;
  conversation_id: string;
  crew_id: number;
  profile_id: string;
  input: string;
  result: string;
  messages: string[];
}

export function useChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentJobRef = useRef<{
    steps: Message[];
    tasks: Message[];
    results: Message[];
  }>({
    steps: [],
    tasks: [],
    results: [],
  });
  const [ws, setWs] = useState<WebSocket | null>(null);

  const scrollToBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const handleResetHistory = useCallback(async () => {
    if (!authToken) return;

    try {
      setIsLoading(true); // Set loading state during reset

      // Close existing WebSocket connection if any
      if (ws) {
        // Create a promise that resolves when the WebSocket is closed
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

      // Delete current conversation
      const deleteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/${conversationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(`HTTP error! status: ${deleteResponse.status}`);
      }

      // Create a new conversation
      const newConversationResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!newConversationResponse.ok) {
        throw new Error(`HTTP error! status: ${newConversationResponse.status}`);
      }

      const newConversation = await newConversationResponse.json();
      
      // Reset current job state
      currentJobRef.current = {
        steps: [],
        tasks: [],
        results: [],
      };

      // Reset messages and set new conversation ID
      setMessages([]);
      setConversationId(newConversation.id);
      
      // Note: loading state will be reset when new WebSocket connects in the useEffect

    } catch (error) {
      console.error("Error resetting history:", error);
      Sentry.captureException(error);
      toast({
        title: "Error",
        description: "Failed to reset chat history",
        variant: "destructive",
      });
      setIsLoading(false); // Reset loading state on error
    }
  }, [authToken, conversationId, ws, toast]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!authToken) return;

      try {
        const conversationRequest = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/latest`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!conversationRequest.ok) {
          throw new Error(`HTTP error! status: ${conversationRequest.status}`);
        }

        const conversationData = await conversationRequest.json();
        setConversationId(conversationData.id);

        const detailedConversationResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/conversations/${conversationData.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!detailedConversationResponse.ok) {
          throw new Error(
            `HTTP error! status: ${detailedConversationResponse.status}`
          );
        }

        const detailedConversationData =
          await detailedConversationResponse.json();

        const formattedJobs = detailedConversationData.jobs.map((job: Job) => ({
          id: job.id,
          created_at: job.created_at,
          conversation_id: job.conversation_id,
          crew_id: job.crew_id,
          profile_id: job.profile_id,
          input: job.input,
          result: job.result,
          messages: job.messages.map((msg: string) => {
            const parsedMsg = JSON.parse(msg);
            return {
              role: parsedMsg.role as "user" | "assistant",
              type: parsedMsg.type as "task" | "step" | "result" | null,
              content: parsedMsg.content,
              timestamp: new Date(parsedMsg.timestamp),
            };
          }),
        }));

        const initialMessage: Message = {
          role: "assistant",
          type: null,
          content: "Welcome back! Let's see what your ai can pull off today.",
          timestamp: new Date(),
        };
        if (formattedJobs.length > 0) {
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          const allMessages = formattedJobs.flatMap((job: { messages: any; }) => job.messages);
          setMessages([initialMessage, ...allMessages]);
        } else {
          setMessages([initialMessage]);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
        Sentry.captureException(error);
        toast({
          title: "Error",
          description: "Failed to load chat history.",
          variant: "destructive",
        });
      }
    };

    fetchHistory();
  }, [authToken, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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

  useEffect(() => {
    if (!conversationId || !authToken) return;

    const wsUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/chat/conversation/${conversationId}/ws`);
    wsUrl.searchParams.append('token', authToken);
    
    const newWs = new WebSocket(wsUrl.toString());

    newWs.onopen = () => {
      console.log('WebSocket connection established');
      setIsLoading(false); // Ensure loading state is reset when WebSocket is ready
    };

    newWs.onmessage = (event) => {
      try {
        if (!event.data || event.data.trim() === "") return;

        const data = JSON.parse(event.data);
        if (!data || typeof data !== "object") return;

        switch (data.type) {
          case 'history':
            console.log('Raw history data:', data);
            // Set initial conversation history
            const historyMessages = data.messages.map((msg: any) => {
              console.log('Processing history message:', msg);
              // Ensure timestamp is properly parsed from the message
              const timestamp = msg.timestamp || msg.created_at || msg.job_started_at || new Date().toISOString();
              const processedMsg = {
                role: msg.role,
                type: msg.type,
                content: msg.content,
                timestamp: new Date(timestamp),
              };
              console.log('Processed message:', processedMsg);
              return processedMsg;
            });
            console.log('Final history messages:', historyMessages);
            // Sort messages by timestamp
            historyMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
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

          case 'stream':
            const newMessage: Message = {
              role: "assistant",
              type: data.stream_type,
              content: data.content,
              timestamp: new Date(data.timestamp),
            };

            switch (data.stream_type) {
              case "step":
                currentJobRef.current.steps.push(newMessage);
                break;
              case "task":
                currentJobRef.current.tasks.push(newMessage);
                break;
              case "result":
                currentJobRef.current.results.push(newMessage);
                setIsLoading(false);
                break;
              default:
                console.warn("Unknown stream type:", data.stream_type);
            }

            // Update messages with all current groups
            setMessages((prev) => {
              const withoutCurrentJob = prev.filter(
                (msg) =>
                  msg.role !== "assistant" ||
                  !msg.type ||
                  msg.timestamp < new Date(data.job_started_at)
              );

              return [
                ...withoutCurrentJob,
                ...currentJobRef.current.tasks,
                ...currentJobRef.current.steps,
                ...currentJobRef.current.results,
              ];
            });
            break;

          case 'user_message':
            // Add user message from history
            const userMessage: Message = {
              role: "user",
              type: null,
              content: data.content,
              timestamp: new Date(data.timestamp),
            };
            setMessages(prev => [...prev, userMessage]);
            break;

          case 'error':
            console.error('Error from WebSocket:', data.message);
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive",
            });
            setIsLoading(false);
            break;

          default:
            console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
        Sentry.captureException(error);
      }
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
      Sentry.captureException(error);
      toast({
        title: "Error",
        description: "Connection error occurred",
        variant: "destructive",
      });
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
      setWs(null);
    };

    setWs(newWs);

    return () => {
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.close();
      }
    };
  }, [conversationId, authToken, toast]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading || !ws || ws.readyState !== WebSocket.OPEN) return;

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
        ws.send(JSON.stringify({
          type: 'chat_message',
          message: input
        }));
      } catch (error) {
        console.error("Error sending message:", error);
        Sentry.captureException(error);
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    },
    [input, isLoading, ws, toast]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    handleResetHistory,
    messagesEndRef,
  };
}
