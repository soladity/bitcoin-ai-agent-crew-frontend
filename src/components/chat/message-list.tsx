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
  console.log("MessageList - Raw messages:", messages);
  const groupedMessages = messages.reduce<Message[]>((acc, message) => {
    const lastMessage = acc[acc.length - 1];
    console.log("Processing message:", { message, lastMessage });

    // Skip job_started messages
    if (message.type === 'job_started') {
      console.log("Skipping job_started message");
      return acc;
    }

    // Handle token messages
    if (message.type === "token") {
      console.log("Token message detected:", message);
      
      // If we have a processing token message, append to it
      if (lastMessage?.type === "token" && lastMessage.status === "processing") {
        console.log("Appending to last message:", { lastMessage, newContent: message.content });
        lastMessage.content = (lastMessage.content || '') + (message.content || '');
        if (message.status === "end") {
          lastMessage.status = "end";
          console.log("Updating last message to end status");
        }
        return acc;
      }
      
      // Start a new token message
      if (message.status === "processing" || message.status === "end") {
        console.log("Creating new token message");
        acc.push({
          ...message,
          content: message.content || '',
          role: message.role || 'assistant'
        });
      }
      return acc;
    }

    acc.push(message);
    return acc;
  }, []);

  console.log("MessageList - Grouped messages:", groupedMessages);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-4 p-4"
    >
      {groupedMessages.map((message, index) => (
        <div
          key={index}
          ref={index === groupedMessages.length - 1 ? lastMessageRef : null}
        >
          <ChatMessageBubble
            message={message}
          />
        </div>
      ))}
    </div>
  );
}
