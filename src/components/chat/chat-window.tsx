"use client";

import { useEffect, useCallback } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Check, X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { useThread } from "@/hooks/use-thread";
import { Input } from "@/components/ui/input";
import { useThreadsStore } from "@/store/threads";

export function ChatWindow() {
  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    isConnected,
    selectedAgentId,
    setSelectedAgent,
    clearMessages,
    connect,
    disconnect,
    activeThreadId,
  } = useChatStore();

  const { thread, clearThread } = useThread(activeThreadId || "");
  const { accessToken } = useSessionStore();
  const {
    isEditing,
    editedTitle,
    startEditing,
    cancelEditing,
    setEditedTitle,
    saveEdit,
  } = useThreadsStore();
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const memoizedConnect = useCallback(
    (token: string) => {
      connect(token);
    },
    [connect]
  );

  const memoizedDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // Handle WebSocket connection
  useEffect(() => {
    let mounted = true;

    if (!accessToken) {
      return;
    }

    const connectWithDelay = () => {
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          if (mounted) {
            memoizedConnect(accessToken);
          }
        }, 100);
      } else {
        memoizedConnect(accessToken);
      }
    };

    connectWithDelay();

    return () => {
      mounted = false;
      if (process.env.NODE_ENV !== "development") {
        console.log("ChatWindow unmounting, disconnecting WebSocket");
        memoizedDisconnect();
      }
    };
  }, [accessToken, memoizedConnect, memoizedDisconnect]);

  // create function to clear messages for a specific thread
  const clearMessagesInThread = async (threadId: string) => {
    try {
      await clearThread();
      clearMessages(threadId);
    } catch (error) {
      console.error("Error clearing thread:", error);
    }
  };

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertDescription>Please sign in to start chatting</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!activeThreadId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertDescription>
            Please select a thread to start chatting
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Header - Fixed at top */}
      <div className="sticky dark:lg:bg-zinc-950 top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center  gap-2">
          {!isConnected && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          )}
          <span
            className={`text-sm ${
              isConnected ? "text-green-500" : "text-zinc-400"
            }`}
          >
            {isConnected ? "Connected" : "Connecting..."}
          </span>
          <span className="text-sm text-zinc-400 mx-2">•</span>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  className="h-7 w-48"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter thread name"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => saveEdit(activeThreadId)}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={cancelEditing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium truncate">
                  {thread?.title || "Untitled Thread"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => startEditing(activeThreadId)}
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
          onClick={() => clearMessagesInThread(activeThreadId)}
          disabled={isChatLoading}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Message List - Scrollable area */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col justify-end">
        {chatError && (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{chatError}</AlertDescription>
          </Alert>
        )}
        <MessageList messages={threadMessages} />
      </div>

      {/* Input - Fixed at bottom */}
      <div className="sticky bottom-0 dark:lg:bg-zinc-950 z-10 border-t border-zinc-800">
        <ChatInput
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgent}
          disabled={isChatLoading || !isConnected}
        />
      </div>
    </div>
  );
}
