import { create } from "zustand";
import { Message } from '@/lib/chat/types';
import { useThreadsStore } from "./threads";

// Global WebSocket instance
let globalWs: WebSocket | null = null;

interface ChatState {
  messages: Record<string, Message[]>;
  fetchedThreads: Set<string>;  // Track which threads we've fetched
  activeThreadId: string | null;
  selectedAgentId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  ws: WebSocket | null;

  // Connection
  connect: (accessToken: string) => void;
  disconnect: () => void;

  // Messages
  sendMessage: (threadId: string, content: string) => void;
  addMessage: (message: Message) => void;
  clearMessages: (threadId: string) => void;

  // Threads
  setActiveThread: (threadId: string) => void;
  getThreadHistory: () => void;

  // Agent
  setSelectedAgent: (agentId: string | null) => void;

  // Status
  setConnectionStatus: (isConnected: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  fetchedThreads: new Set(),
  activeThreadId: null,
  selectedAgentId: null,
  isConnected: false,
  isLoading: false,
  error: null,
  ws: globalWs,

  setSelectedAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  connect: (accessToken: string) => {
    // Don't reconnect if already connected or connecting
    if (globalWs && (globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting, skipping connection');
      return;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/chat/ws";
      if (!wsUrl) {
        throw new Error("WebSocket URL not configured");
      }

      console.log('Creating new WebSocket connection');
      globalWs = new WebSocket(`${wsUrl}?token=${accessToken}`);

      globalWs.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, error: null, ws: globalWs });
      };

      globalWs.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false, ws: null });
        globalWs = null;
      };

      globalWs.onerror = (error) => {
        console.error('WebSocket error:', error);
        set({ error: "WebSocket connection error" });
      };

      globalWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          if (data.type === "token") {
            get().addMessage(data);
          } else {
            get().addMessage(data);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
    } catch (error) {
      console.error('Connection error:', error);
      set({ error: "Failed to connect to WebSocket", isConnected: false });
    }
  },

  disconnect: () => {
    if (globalWs?.readyState === WebSocket.OPEN || globalWs?.readyState === WebSocket.CONNECTING) {
      console.log('Closing WebSocket connection');
      globalWs.close();
      globalWs = null;
      set({ isConnected: false, ws: null });
    }
  },

  clearMessages: (threadId) => {
    // Send delete message through WebSocket
    if (globalWs?.readyState === WebSocket.OPEN) {
      try {
        globalWs.send(JSON.stringify({
          type: "delete_thread",
          thread_id: threadId,
        }));
      } catch (error) {
        console.error("Failed to send delete thread message:", error);
      }
    }

    // Clear messages and remove thread from local state
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: []
      },
      activeThreadId: null,
      fetchedThreads: new Set(Array.from(state.fetchedThreads).filter(id => id !== threadId))
    }));

    // Remove thread from threads store
    useThreadsStore.getState().removeThread(threadId);
  },

  addMessage: (message: Message) => {
    set((state) => {
      const messages = state.messages[message.thread_id] || [];
      const lastMessage = messages[messages.length - 1];

      // For token messages, try to append to last message if it's processing
      if (message.type === 'token') {
        if (lastMessage?.type === 'token' && lastMessage.status === 'processing') {
          const updatedMessages = [...messages];
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + (message.content || ''),
            status: message.status
          };
          return {
            messages: {
              ...state.messages,
              [message.thread_id]: updatedMessages
            }
          };
        }
      }

      // For non-token messages or new token messages
      return {
        messages: {
          ...state.messages,
          [message.thread_id]: [...messages, message]
        }
      };
    });
  },

  setActiveThread: (threadId) => {
    set({ activeThreadId: threadId });

    // Only get thread history if we haven't fetched it before
    const state = get();
    if (!state.fetchedThreads.has(threadId)) {
      setTimeout(() => {
        get().getThreadHistory();
        // Add thread to fetched set after getting history
        set(state => ({
          fetchedThreads: new Set(Array.from(state.fetchedThreads).concat([threadId]))
        }));
      }, 0);
    }
  },

  getThreadHistory: () => {
    if (!globalWs || globalWs.readyState !== WebSocket.OPEN) {
      set({ error: "WebSocket not connected" });
      return;
    }
    // Send message through WebSocket
    try {
      globalWs.send(JSON.stringify({
        type: "history",
        role: "user",
        status: "sent",
        thread_id: get().activeThreadId,
        agent_id: get().selectedAgentId
      }));
    } catch (error) {
      set({ error: "Failed to send message" });
      console.error("Send error:", error);
    }
  },

  sendMessage: (threadId, content) => {
    if (!globalWs || globalWs.readyState !== WebSocket.OPEN) {
      set({ error: "WebSocket not connected" });
      return;
    }

    // Add user message immediately
    get().addMessage({
      agent_id: get().selectedAgentId,
      thread_id: threadId,
      role: "user",
      content,
      type: "message",
      status: "sent"
    });

    // Send message through WebSocket
    try {
      globalWs.send(JSON.stringify({
        type: "message",
        role: "user",
        status: "sent",
        content,
        thread_id: threadId,
        agent_id: get().selectedAgentId
      }));
    } catch (error) {
      set({ error: "Failed to send message" });
      console.error("Send error:", error);
    }
  },

  setConnectionStatus: (isConnected) => set({ isConnected }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
