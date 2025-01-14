"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, User } from "lucide-react";
import { Message } from "@/lib/chat/types";
import { useAgent } from "@/hooks/use-agent";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export function ChatMessageBubble({ message }: { message: Message }) {
  const { agent } = useAgent(
    message.role === "assistant" ? message.agent_id : null
  );

  const AgentAvatar = () => {
    const shouldShowOverlay =
      agent?.name && agent.name.toLowerCase() !== "assistant";

    return (
      <Avatar className="h-6 w-6 relative">
        <AvatarImage src={agent?.image_url} alt={agent?.name || "Bot"} />
        <AvatarFallback>
          <Image
            src="/logos/aibtcdev-avatar-1000px.png"
            alt="AI BTC Dev"
            width={24}
            height={24}
          />
        </AvatarFallback>
        {shouldShowOverlay && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Avatar>
    );
  };

  return (
    <div
      className={cn(
        "flex w-full gap-2 px-2 py-1 group min-w-0",
        message.role === "user" ? "flex-row-reverse" : ""
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full",
          message.role === "user"
            ? "bg-blue-600 text-white"
            : "bg-zinc-700 text-zinc-300"
        )}
      >
        {message.role === "user" ? (
          <User className="h-3 w-3" />
        ) : (
          <AgentAvatar />
        )}
      </div>

      <div
        className={cn(
          "flex flex-col min-w-0 space-y-1",
          message.role === "user" ? "items-end" : "items-start",
          "max-w-[75%] w-fit"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3 py-2 w-fit max-w-full",
            message.role === "user"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-200"
          )}
        >
          {message.type === "tool" && message.tool && (
            <div
              className={cn(
                "text-xs font-medium mb-1",
                message.role === "user" ? "text-blue-100" : "text-indigo-400"
              )}
            >
              {message.tool}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
            {message.content || ""}
          </p>
        </div>
        {message.created_at && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-1",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <p className="text-[10px] text-zinc-500">
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
            {message.status === "processing" && (
              <Clock className="h-3 w-3 text-zinc-400 animate-pulse" />
            )}
            {message.status === "end" && (
              <CheckCircle2 className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
