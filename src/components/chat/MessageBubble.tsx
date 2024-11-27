"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const renderToolInfo = () => {
    if (!message.tool) return null;

    return (
      <div className="mt-4 space-y-2 bg-black/20 p-3 rounded">
        <div className="text-xs font-mono text-white/80">
          <span className="font-semibold">Tool:</span> {message.tool}
        </div>
        {message.tool_input && (
          <div className="text-xs font-mono">
            <span className="font-semibold text-white/80">Input:</span>
            <pre className="mt-1 p-2 bg-black/30 rounded overflow-x-auto">
              {message.tool_input}
            </pre>
          </div>
        )}
        {message.result && (
          <div className="text-xs font-mono">
            <span className="font-semibold text-white/80">Output:</span>
            <pre className="mt-1 p-2 bg-black/30 rounded overflow-x-auto whitespace-pre-wrap">
              {message.result}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <>
      {message.type && (
        <div className="text-xs mb-1 text-white/80 font-semibold uppercase">
          {message.type}
        </div>
      )}
      <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
        {message.content}
      </ReactMarkdown>
      {renderToolInfo()}
      <div className="text-xs mt-2 text-white/80">
        {message.timestamp.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </>
  );

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
