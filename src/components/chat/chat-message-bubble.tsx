"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, User } from "lucide-react";
import { Message } from "@/lib/chat/types";
import { useAgent } from "@/hooks/use-agent";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import { memo } from "react";
import { Agent } from "@/types/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

// Separate AgentAvatar into its own memoized component
const AgentAvatar = memo(({ agent }: { agent: Agent | null }) => {
  const shouldShowOverlay =
    agent?.name && agent.name.toLowerCase() !== "assistant";

  return (
    <Avatar className="h-6 w-6 relative">
      {agent?.image_url ? (
        <AvatarImage
          src={agent.image_url}
          alt={agent?.name || "Bot"}
          className="object-cover"
        />
      ) : null}
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
});
AgentAvatar.displayName = "AgentAvatar";

// Custom components for markdown rendering
export const MarkdownComponents: Components = {
  p: ({ children, ...props }) => (
    <p className="mb-2 last:mb-0" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="marker:text-zinc-500" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded bg-zinc-700/50 px-1.5 py-0.5 text-sm font-mono"
      {...props}
    >
      {children}
    </code>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-2 border-zinc-500 pl-4 italic" {...props}>
      {children}
    </blockquote>
  ),
};

// Memoize the entire ChatMessageBubble component
export const ChatMessageBubble = memo(({ message }: { message: Message }) => {
  const { agent } = useAgent(
    message.role === "assistant" ? message.agent_id : null
  );

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
          <AgentAvatar agent={agent} />
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
          <div className="text-sm leading-relaxed break-words [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={MarkdownComponents}
            >
              {message.content || ""}
            </ReactMarkdown>
          </div>
        </div>
        {message.created_at && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-1",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <p className="text-xs text-zinc-500">
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
});
ChatMessageBubble.displayName = "ChatMessageBubble";
