"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/chat/types";
import { ChatMessageBubble } from "./chat-message-bubble";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Group messages for streaming
  const groupedMessages = messages.reduce<Message[]>((acc, message) => {
    const lastMessage = acc[acc.length - 1];

    // Handle token messages
    if (message.type === "token") {
      // If we have a processing token message, append to it
      if (
        lastMessage?.type === "token" &&
        lastMessage.status === "processing"
      ) {
        lastMessage.content =
          (lastMessage.content || "") + (message.content || "");
        if (message.status === "end") {
          lastMessage.status = "end";
        }
        return acc;
      }

      // Start a new token message
      if (message.status === "processing" || message.status === "end") {
        acc.push({
          ...message,
          content: message.content || "",
          role: message.role || "assistant",
        });
      }
      return acc;
    }

    acc.push(message);
    return acc;
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-3 p-2 w-full min-w-0"
    >
      {groupedMessages.map((message, index) => (
        <div
          key={index}
          ref={index === groupedMessages.length - 1 ? lastMessageRef : null}
          className="w-full min-w-0"
        >
          <ChatMessageBubble message={message} />
        </div>
      ))}
    </div>
  );
}
