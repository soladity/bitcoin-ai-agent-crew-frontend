"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { useThread } from "@/hooks/use-thread";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatInputProps {
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string | null) => void;
  disabled?: boolean;
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, activeThreadId, clearMessages } = useChatStore();
  const { accessToken } = useSessionStore();
  const { clearThread } = useThread(activeThreadId || "");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || !accessToken || !activeThreadId) return;

      try {
        await sendMessage(activeThreadId, input.trim());
        setInput("");
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeThreadId, input, sendMessage, accessToken]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);

      // Auto-resize the textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 200) + "px";
      }
    },
    []
  );

  const clearMessagesInThread = async () => {
    if (!activeThreadId) return;
    try {
      // First clear the messages in Supabase
      await clearThread();
      // Then clear the local state
      clearMessages(activeThreadId);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error clearing messages:", error);
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <div className="w-full min-w-0 border-zinc-800">
      <div className="mx-auto max-w-5xl px-2 py-2 w-full min-w-0">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-2 w-full min-w-0"
        >
          <div className="flex flex-1 gap-2 min-w-0 w-full">
            <div className="relative flex-1 min-w-0">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                disabled={disabled}
                className={cn(
                  "min-h-[44px] h-11 max-h-[200px] resize-none w-full",
                  "py-2.5 px-3 bg-background/50 backdrop-blur-sm border-border/10",
                  "text-foreground placeholder-muted-foreground",
                  "text-sm rounded-xl",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "transition-colors duration-200",
                  "pr-12" // Add padding for the delete button
                )}
                rows={1}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowDeleteDialog(true)}
                disabled={disabled}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={disabled || !input.trim()}
              className="h-11 w-11 rounded-full p-0 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

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
              onClick={clearMessagesInThread}
              disabled={disabled}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
