"use client";

import { useEffect, useCallback, useState } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Check, X, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { useThread } from "@/hooks/use-thread";
import { Input } from "@/components/ui/input";
import { useThreadsStore } from "@/store/threads";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentWalletSelector from "./agent-selector";
import { CreateThreadButton } from "../threads/CreateThreadButton";
import { StartGuide } from "../reusables/StartGuide";

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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        // console.log("ChatWindow unmounting, disconnecting WebSocket");
        memoizedDisconnect();
      }
    };
  }, [accessToken, memoizedConnect, memoizedDisconnect]);

  // create function to clear messages for a specific thread
  const clearMessagesInThread = async (threadId: string) => {
    try {
      await clearThread();
      clearMessages(threadId);
      setShowDeleteDialog(false);
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
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] backdrop-blur-sm">
        <div className="text-center space-y-4 p-4 sm:p-6 lg:p-8 -mt-20">
          {/* Adjust button size and spacing for different screen sizes */}
          <div className="flex justify-center gap-3" id="step3">
            <CreateThreadButton />
            <div className="md:block hidden">
              <StartGuide />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative h-[94dvh] md:h-[100dvh] w-full min-w-0 max-w-full">
      {/* Header */}
      <div className="sticky top-0  flex items-center justify-between px-2 md:px-4 h-14 border-b border-border/10 min-w-0 bg-background/80 backdrop-blur-sm w-full">
        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
          {!isConnected && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
          )}
          <span
            className={cn(
              "text-xs flex-shrink-0",
              isConnected ? "text-emerald-500" : "text-muted-foreground"
            )}
          >
            {isConnected ? "Connected" : "Connecting..."}
          </span>
          <span className="text-xs text-muted-foreground/40 mx-2 flex-shrink-0">
            •
          </span>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full">
                <Input
                  className="h-8 w-full md:w-48 text-sm bg-background/50"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter thread name"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => saveEdit(activeThreadId)}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={cancelEditing}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium truncate min-w-0 flex-1">
                  {thread?.title || "Untitled Thread"}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => startEditing(activeThreadId)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isChatLoading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className=" flex-shrink-0 ml-2">
          <AgentWalletSelector
            selectedAgentId={selectedAgentId}
            onSelect={setSelectedAgent}
            disabled={isChatLoading || !isConnected}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clear Chat Messages</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all messages in this chat? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearMessagesInThread(activeThreadId)}
              disabled={isChatLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message List */}
      <div className="flex-1 overflow-hidden w-full min-w-0 max-w-full">
        <ScrollArea className="h-full w-full pb-4">
          <div className="flex flex-col justify-end min-h-full w-full max-w-full">
            {chatError && (
              <Alert
                variant="destructive"
                className="mx-2 md:mx-4 my-2 md:my-4"
              >
                <AlertDescription>{chatError}</AlertDescription>
              </Alert>
            )}
            <MessageList messages={threadMessages} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border/10 bg-background/80 backdrop-blur-sm w-full min-w-0 pb-safe">
        <ChatInput
          selectedAgentId={selectedAgentId}
          onAgentSelect={setSelectedAgent}
          disabled={isChatLoading || !isConnected}
        />
      </div>
    </div>
  );
}
