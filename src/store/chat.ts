import { create } from "zustand";
import { Message, Conversation } from '@/lib/chat/types';
import { supabase } from "@/utils/supabase/client";

// Global WebSocket instance
let globalWs: WebSocket | null = null;

interface ChatState {
  messages: Record<string, Message[]>;
  conversations: Conversation[];
  activeConversationId: string | null;
  selectedAgentId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  ws: WebSocket | null;

  // Connection
  connect: (conversationId: string, accessToken: string) => void;
  disconnect: () => void;
  
  // Messages
  sendMessage: (conversationId: string, content: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  clearMessages: (conversationId: string) => void;

  // Conversations
  setActiveConversation: (conversationId: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, update: Partial<Conversation>) => void;

  // Agent
  setSelectedAgent: (agentId: string | null) => void;

  // Status
  setConnectionStatus: (isConnected: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  conversations: [],
  activeConversationId: null,
  selectedAgentId: null,
  isConnected: false,
  isLoading: false,
  error: null,
  ws: globalWs,

  setSelectedAgent: (agentId) => {
    set({ selectedAgentId: agentId });
  },

  connect: (conversationId: string, accessToken: string) => {
    // Close existing connection if any
    if (globalWs) {
      globalWs.close();
      globalWs = null;
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://localhost:8000/chat/ws";
      if (!wsUrl) {
        throw new Error("WebSocket URL not configured");
      }

      globalWs = new WebSocket(`${wsUrl}?token=${accessToken}&conversation_id=${conversationId}`);

      globalWs.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, error: null });
      };

      globalWs.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false });
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
            get().addMessage(conversationId, data);
          } else {
            get().addMessage(conversationId, data);
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
    if (globalWs) {
      console.log('Closing WebSocket connection');
      globalWs.close();
      globalWs = null;
      set({ isConnected: false });
    }
  },

  clearMessages: (conversationId) => {
    // delete conversation
    console.log('Clearing messages for conversation:', conversationId);

    // clear messages
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: []
      }
    }));
  },

  addMessage: (conversationId: string, message: Message) => {
    set((state) => {
      const messages = state.messages[conversationId] || [];
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
              [conversationId]: updatedMessages
            }
          };
        }
      }

      // For non-token messages or new token messages
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...messages, message]
        }
      };
    });
  },

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })),

  updateConversation: (conversationId, update) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, ...update } : conv
      ),
    })),

  sendMessage: (conversationId, content) => {
    if (!globalWs || globalWs.readyState !== WebSocket.OPEN) {
      set({ error: "WebSocket not connected" });
      return;
    }

    // Add user message immediately
    get().addMessage(conversationId, {
      agent_id: get().selectedAgentId,
      conversation_id: conversationId,
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
        conversation_id: conversationId,
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
