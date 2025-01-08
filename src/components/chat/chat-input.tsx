"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { AgentSelector } from "./agent-selector";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";

interface ChatInputProps {
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string | null) => void;
  disabled?: boolean;
}

export function ChatInput({
  selectedAgentId,
  onAgentSelect,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, activeThreadId } = useChatStore();
  const { accessToken } = useSessionStore();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!input.trim() || !selectedAgentId || !accessToken || !activeThreadId)
        return;

      try {
        await sendMessage(activeThreadId, input.trim());
        setInput("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [activeThreadId, input, selectedAgentId, sendMessage, accessToken]
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
          textareaRef.current.scrollHeight + "px";
      }
    },
    []
  );

  if (!accessToken) {
    return null;
  }

  return (
    <div className="w-full border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-shrink-0">
            <AgentSelector
              selectedAgentId={selectedAgentId}
              onSelect={onAgentSelect}
              disabled={disabled}
            />
          </div>
          <div className="flex-1 flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={disabled}
              className={cn(
                "min-h-[44px] max-h-[200px] resize-none",
                "py-3 px-4 bg-zinc-800 border-zinc-700",
                "text-white placeholder-zinc-400"
              )}
              rows={1}
            />
            <Button
              type="submit"
              disabled={disabled || !input.trim()}
              className="h-11 w-11 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
