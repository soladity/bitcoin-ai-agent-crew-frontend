"use client";

import { useEffect } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const {
    messages,
    isLoading,
    error,
    isConnected,
    selectedAgentId,
    setSelectedAgent,
    clearMessages,
    connect,
    disconnect
  } = useChatStore();

  const { accessToken } = useSessionStore();
  const conversationMessages = messages[conversationId] || [];

  // Handle WebSocket connection
  useEffect(() => {
    if (!accessToken) {
      disconnect();
      return;
    }

    // Connect when component mounts or conversation changes
    connect(conversationId, accessToken);

    // Cleanup when component unmounts or conversation changes
    return () => {
      console.log('ChatWindow unmounting, disconnecting WebSocket');
      disconnect();
    };
  }, [conversationId, accessToken, connect, disconnect]);

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertDescription>
            Please sign in to start chatting
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header - Fixed at top */}
      <div className="sticky top-0 z-10 bg-background flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {!isConnected && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          )}
          <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-zinc-400'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearMessages(conversationId)}
          disabled={isLoading || conversationMessages.length === 0}
        >
          Clear Chat
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Message List - Scrollable area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={conversationMessages} 
        />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="sticky bottom-0 z-10 border-t border-zinc-800">
        <div className="p-4">
          <ChatInput
            conversationId={conversationId}
            selectedAgentId={selectedAgentId}
            onAgentSelect={setSelectedAgent}
            disabled={isLoading || !isConnected}
          />
        </div>
      </div>
    </div>
  );
}
