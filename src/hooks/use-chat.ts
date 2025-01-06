import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { Message } from "@/lib/chat/types";

export function useChat(conversationId: string) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  const lastStreamedContentRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Fetch current user and their profile
  useEffect(() => {
    async function fetchUserAndProfile() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setProfileId(user.id);
      }
    }
    fetchUserAndProfile();
  }, []);

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
      setIsConnected(true);
      setIsLoading(false);
    };

    newWs.onmessage = (event) => {
      try {
        if (!event.data || event.data.trim() === "") return;

        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === "stream") {
          switch (data.stream_type) {
            case "token":
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                
                // If last message is a tool message or not an assistant message,
                // create a new message for tokens
                if (!lastMessage || 
                    lastMessage.role !== "assistant" || 
                    lastMessage.type === "tool") {
                  return [...prev, {
                    role: "assistant",
                    type: null,
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                    agent_id: data.agent_id,
                    tool_calls: []
                  }];
                }
                
                // Otherwise, update the existing message with new content
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + data.content
                  }
                ];
              });
              break;
            case "tool":
              // Create a standalone tool message
              setMessages(prev => [...prev, {
                role: "assistant",
                type: "tool",
                content: "",
                timestamp: new Date(data.timestamp),
                agent_id: data.agent_id,
                tool: data.tool,
                tool_input: data.tool_input,
                tool_output: data.tool_output || "",
                tool_calls: []
              }]);
              break;
            case "step":
              // Reset the streamed content when we get a new step
              lastStreamedContentRef.current = null;
              currentJobRef.current.steps.push({
                role: "assistant",
                type: "step",
                content: data.content,
                timestamp: new Date(data.timestamp),
                tool: data.tool,
                tool_input: data.tool_input,
                tool_output: data.tool_output || "",
                agent_id: data.agent_id,
                tool_calls: data.tool_calls || [],
              });
              break;
            case "task":
              // Reset the streamed content when we get a new task
              lastStreamedContentRef.current = null;
              // Skip storing task messages
              break;
            case "result":
              // Check if the result matches the last streamed content
              console.log('Last streamed content:', lastStreamedContentRef.current);
              console.log('New result content:', data.content);
              if (!lastStreamedContentRef.current || lastStreamedContentRef.current.trim() !== data.content.trim()) {
                currentJobRef.current.results.push({
                  role: "assistant",
                  type: "result",
                  content: data.content,
                  timestamp: new Date(data.timestamp),
                  tool: data.tool,
                  tool_input: data.tool_input,
                  tool_output: data.tool_output || "",
                  agent_id: data.agent_id,
                  tool_calls: undefined
                });
              }
              setIsLoading(false);
              // Reset the streamed content after processing the result
              lastStreamedContentRef.current = null;
              break;
            case "end":
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
              ...currentJobRef.current.steps,
              ...currentJobRef.current.results,
            ];
          });
        } else if (data.type === "history") {
          console.log('Raw history data:', data);
          // Set initial conversation history
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          const historyMessages = data.messages.map((msg: any) => {
            console.log('Processing history message:', msg);
            // Ensure timestamp is properly parsed from the message
            const timestamp = msg.timestamp || msg.created_at || msg.job_started_at || new Date().toISOString();
            // Skip step messages with empty thoughts
            if (msg.type === "step" && (!msg.thought || msg.thought.trim() === "")) {
              return null;
            }
            const processedMsg = {
              role: msg.role,
              type: msg.type,
              content: msg.type === "step" ? msg.thought : msg.content,
              timestamp: new Date(timestamp),
              tool: msg.tool,
              tool_input: msg.tool_input,
              tool_output: msg.tool_output,
              agent_id: msg.agent_id,
            };
            console.log('Processed message:', processedMsg);
            return processedMsg;
          })
          .filter((msg: Message | null): msg is Message => msg !== null && msg.type !== "task");
          console.log('Final history messages:', historyMessages);
          // Sort messages by timestamp
          historyMessages.sort((a: { timestamp: { getTime: () => number; }; }, b: { timestamp: { getTime: () => number; }; }) => a.timestamp.getTime() - b.timestamp.getTime());
          setMessages(historyMessages);
        } else if (data.type === "job_started") {
          console.log('New job started:', data.job_id);
          // Reset the current job's message groups when a new job starts
          currentJobRef.current = {
            steps: [],
            tasks: [],
            results: [],
          };
        } else if (data.type === "user_message") {
          // Add user message from history
          const userMessage: Message = {
            role: "user",
            type: null,
            content: data.content,
            timestamp: new Date(data.timestamp),
          };
          setMessages(prev => [...prev, userMessage]);
        } else if (data.type === "error") {
          console.error('Error from WebSocket:', data.message);
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
          setIsLoading(false);
        } else {
          console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Error",
        description: "Connection error occurred",
        variant: "destructive",
      });
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
  }, [conversationId, authToken, toast]);

  const handleReconnect = useCallback(async () => {
    if (!conversationId || !authToken) return;

    // Close existing WebSocket if any
    if (ws) {
      ws.close();
      setWs(null);
    }

    // Create new WebSocket connection
    const wsUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/chat/conversation/${conversationId}/ws`);
    wsUrl.searchParams.append('token', authToken);

    const newWs = new WebSocket(wsUrl.toString());

    newWs.onopen = () => {
      console.log('WebSocket connection re-established');
      setIsConnected(true);
      setIsLoading(false);
      toast({
        title: "Connected",
        description: "Successfully reconnected to the chat",
      });
    };

    newWs.onmessage = (event) => {
      try {
        if (!event.data || event.data.trim() === "") return;

        const data = JSON.parse(event.data);
        console.log('Received message:', data);

        if (data.type === "stream") {
          switch (data.stream_type) {
            case "token":
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                
                // If last message is a tool message or not an assistant message,
                // create a new message for tokens
                if (!lastMessage || 
                    lastMessage.role !== "assistant" || 
                    lastMessage.type === "tool") {
                  return [...prev, {
                    role: "assistant",
                    type: null,
                    content: data.content,
                    timestamp: new Date(data.timestamp),
                    agent_id: data.agent_id,
                    tool_calls: []
                  }];
                }
                
                // Otherwise, update the existing message with new content
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + data.content
                  }
                ];
              });
              break;
            case "tool":
              // Create a standalone tool message
              setMessages(prev => [...prev, {
                role: "assistant",
                type: "tool",
                content: "",
                timestamp: new Date(data.timestamp),
                agent_id: data.agent_id,
                tool: data.tool,
                tool_input: data.tool_input,
                tool_output: data.tool_output || "",
                tool_calls: []
              }]);
              break;
            case "step":
              // Reset the streamed content when we get a new step
              lastStreamedContentRef.current = null;
              currentJobRef.current.steps.push({
                role: "assistant",
                type: "step",
                content: data.content,
                timestamp: new Date(data.timestamp),
                tool: data.tool,
                tool_input: data.tool_input,
                tool_output: data.tool_output || "",
                agent_id: data.agent_id,
                tool_calls: data.tool_calls || [],
              });
              break;
            case "task":
              // Reset the streamed content when we get a new task
              lastStreamedContentRef.current = null;
              // Skip storing task messages
              break;
            case "result":
              // Check if the result matches the last streamed content
              console.log('Last streamed content:', lastStreamedContentRef.current);
              console.log('New result content:', data.content);
              if (!lastStreamedContentRef.current || lastStreamedContentRef.current.trim() !== data.content.trim()) {
                currentJobRef.current.results.push({
                  role: "assistant",
                  type: "result",
                  content: data.content,
                  timestamp: new Date(data.timestamp),
                  tool: data.tool,
                  tool_input: data.tool_input,
                  tool_output: data.tool_output || "",
                  agent_id: data.agent_id,
                });
              }
              setIsLoading(false);
              // Reset the streamed content after processing the result
              lastStreamedContentRef.current = null;
              break;
            case "end":
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
              ...currentJobRef.current.steps,
              ...currentJobRef.current.results,
            ];
          });
        } else if (data.type === "history") {
          console.log('Raw history data:', data);
          // Set initial conversation history
          // eslint-disable-next-line  @typescript-eslint/no-explicit-any
          const historyMessages = data.messages.map((msg: any) => {
            console.log('Processing history message:', msg);
            // Ensure timestamp is properly parsed from the message
            const timestamp = msg.timestamp || msg.created_at || msg.job_started_at || new Date().toISOString();
            // Skip step messages with empty thoughts
            if (msg.type === "step" && (!msg.thought || msg.thought.trim() === "")) {
              return null;
            }
            const processedMsg = {
              role: msg.role,
              type: msg.type,
              content: msg.type === "step" ? msg.thought : msg.content,
              timestamp: new Date(timestamp),
              tool: msg.tool,
              tool_input: msg.tool_input,
              tool_output: msg.tool_output,
              agent_id: msg.agent_id,
            };
            console.log('Processed message:', processedMsg);
            return processedMsg;
          })
          .filter((msg: Message | null): msg is Message => msg !== null && msg.type !== "task");
          console.log('Final history messages:', historyMessages);
          // Sort messages by timestamp
          historyMessages.sort((a: { timestamp: { getTime: () => number; }; }, b: { timestamp: { getTime: () => number; }; }) => a.timestamp.getTime() - b.timestamp.getTime());
          setMessages(historyMessages);
        } else if (data.type === "job_started") {
          console.log('New job started:', data.job_id);
          // Reset the current job's message groups when a new job starts
          currentJobRef.current = {
            steps: [],
            tasks: [],
            results: [],
          };
        } else if (data.type === "user_message") {
          // Add user message from history
          const userMessage: Message = {
            role: "user",
            type: null,
            content: data.content,
            timestamp: new Date(data.timestamp),
          };
          setMessages(prev => [...prev, userMessage]);
        } else if (data.type === "error") {
          console.error('Error from WebSocket:', data.message);
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
          setIsLoading(false);
        } else {
          console.warn("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Error",
        description: "Connection error occurred",
        variant: "destructive",
      });
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setWs(null);
    };

    setWs(newWs);
  }, [conversationId, authToken, ws, toast]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgentId) return;

    try {
      setIsLoading(true);
      const { error: msgError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            content: input.trim(),
            role: 'user',
          },
        ]);

      if (msgError) throw msgError;
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, selectedAgentId, conversationId, toast]);

  const clearMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;
      setMessages([]);
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: "Error",
        description: "Failed to clear messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, toast]);

  return {
    // State
    messages,
    input,
    isLoading,
    error,
    isConnected,
    selectedAgentId,
    // Actions
    setSelectedAgentId,
    handleInputChange,
    handleSubmit,
    clearMessages,
  };
}
