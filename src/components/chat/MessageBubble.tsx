"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  nested?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, nested = false }) => {
  const content = (
    <>
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
        {message.content}
      </ReactMarkdown>
      {!nested && (
        <div className="text-xs mt-2 text-white/80">
          {message.timestamp.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </>
  );

  if (nested) {
    return (
      <div className="rounded bg-white/10 p-3">
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex mb-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] p-4 rounded-lg shadow-sm break-words",
          message.role === "user"
            ? "bg-orange-500 text-white"
            : "bg-blue-600 text-white"
        )}
      >
        {content}
      </div>
    </div>
  );
};
