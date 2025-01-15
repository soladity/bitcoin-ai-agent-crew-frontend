"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";

interface ChatInputProps {
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string | null) => void;
  disabled?: boolean;
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, activeThreadId } = useChatStore();
  const { accessToken } = useSessionStore();

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
            <div className="flex-1 min-w-0">
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
                  "transition-colors duration-200"
                )}
                rows={1}
              />
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
    </div>
  );
}
