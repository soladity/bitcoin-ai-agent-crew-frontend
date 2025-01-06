"use client";

import { useEffect, useState } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Check, X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { useConversation } from "@/hooks/use-conversation";
import { Input } from "@/components/ui/input";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    isConnected,
    selectedAgentId,
    setSelectedAgent,
    clearMessages,
    connect,
    disconnect
  } = useChatStore();

  const { conversation, clearConversation, updateConversation } = useConversation(conversationId);
  const { accessToken } = useSessionStore();
  const conversationMessages = messages[conversationId] || [];
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  const handleStartEditing = () => {
    setEditedName(conversation?.name || "");
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateConversation({ name: editedName });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update conversation name:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
  };

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

  // create function to clear messages for a specific conversation
  const clearMessagesInConversation = async (conversationId: string) => {
    try {
      await clearConversation();
      clearMessages(conversationId);
      disconnect();
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

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
      <div className="sticky top-0 z-10 bg-background flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {!isConnected && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          )}
          <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-zinc-400'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
          <span className="text-sm text-zinc-400 mx-2">•</span>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  className="h-7 w-48"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter conversation name"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleSaveEdit}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium truncate">
                  {conversation?.name || "Untitled Conversation"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleStartEditing}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => clearMessagesInConversation(conversationId)}
          disabled={isChatLoading || conversationMessages.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Alert */}
      {chatError && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{chatError}</AlertDescription>
        </Alert>
      )}

      {/* Message List - Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList 
          messages={conversationMessages} 
        />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="sticky bottom-0 z-10 bg-background ">
        <div className="p-4">
          <ChatInput
            conversationId={conversationId}
            selectedAgentId={selectedAgentId}
            onAgentSelect={setSelectedAgent}
            disabled={isChatLoading || !isConnected}
          />
        </div>
      </div>
    </div>
  );
}
