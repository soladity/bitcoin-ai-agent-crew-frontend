"use client";

import { cn } from "@/lib/utils";
import { Bot, CheckCircle2, Clock, User } from "lucide-react";
import { Message } from "@/lib/chat/types";

export function ChatMessageBubble({ message }: { message: Message }) {
  console.log("ChatMessageBubble render:", message.tool);
  
  return (
    <div
      className={cn(
        "flex w-full gap-3 px-4 py-3 group transition-colors",
        message.role === "user"
          ? "hover:bg-zinc-900/50 flex-row-reverse"
          : "hover:bg-zinc-900/30"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full",
          message.role === "user"
            ? "bg-gradient-to-br from-zinc-700 to-zinc-800 text-zinc-400"
            : "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white"
        )}
      >
        {message.role === "user" ? (
          <User className="h-3 w-3" />
        ) : (
          <Bot className="h-3 w-3" />
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className={cn(
          "flex items-start gap-2",
          message.role === "user" && "flex-row-reverse"
        )}>
          <div className={cn(
            "flex-1",
            message.role === "user" && "text-right"
          )}>
            {message.type === 'tool' && message.tool && (
              <div className="text-xs font-medium text-indigo-400/80 mb-1">
                {message.tool}
              </div>
            )}
            <p className={cn(
              "text-sm whitespace-pre-wrap leading-relaxed",
              message.role === "user" 
                ? "text-zinc-200" 
                : "text-zinc-300"
            )}>
              {message.content || ''}
            </p>
          </div>
          <div className="flex-shrink-0 mt-1">
            {message.status === "processing" && (
              <Clock className="h-3 w-3 text-indigo-400/70 animate-pulse" />
            )}
            {message.status === "end" && (
              <CheckCircle2 className="h-3 w-3 text-indigo-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
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
