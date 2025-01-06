"use client";

import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Clock, User } from "lucide-react";
import { Message } from "@/lib/chat/types";

export function ChatMessageBubble({ message }: { message: Message }) {
  console.log("ChatMessageBubble render:", message.tool);
  
  return (
    <div
      className={cn(
        "flex w-full gap-2 p-4",
        message.role === "user"
          ? "bg-zinc-900 flex-row"
          : "bg-zinc-800/50 flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border",
          message.role === "user"
            ? "bg-zinc-800 border-zinc-700"
            : "bg-zinc-700 border-zinc-600"
        )}
      >
        {message.role === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      <div>{message.tool}</div>
      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm whitespace-pre-wrap",
            message.role === "user" ? "text-zinc-300" : "text-zinc-400"
          )}>
            {message.type === 'tool' && message.tool && (
              <div className="text-sm font-medium text-primary">
                Using tool: {message.tool}
              </div>
            )}
            {message.content || ''}
          </p>
          {message.status === "processing" && (
            <Clock className="h-3 w-3 text-zinc-500 animate-pulse" />
          )}
          {message.status === "end" && (
            <CheckCircle2 className="h-3 w-3 text-zinc-500" />
          )}
        </div>
        {message.created_at && (
          <p className="text-xs text-zinc-500">
            {new Date(message.created_at).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
