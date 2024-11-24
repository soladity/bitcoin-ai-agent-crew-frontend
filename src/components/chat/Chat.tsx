"use client";

import React from "react";
import { useChat, Message } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { JobMessageGroup } from "@/components/chat/JobMessageGroup";
import { ChatInput } from "@/components/chat/ChatInput";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageGroup {
  role: "user" | "assistant";
  messages: Message[];
}

export default function Chat() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    handleResetHistory,
    messagesEndRef,
  } = useChat();

  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setIsAtBottom(isBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // Group messages by conversation
  const messageGroups = React.useMemo(() => {
    const groups: MessageGroup[] = [];
    let currentUserMessage: Message | null = null;
    let currentAssistantMessages: Message[] = [];

    messages.forEach((message) => {
      // Handle welcome message
      if (!message.type && message.role === "assistant" && message.content.includes("Welcome back")) {
        groups.push({
          role: message.role,
          messages: [message],
        });
        return;
      }

      if (message.role === "user") {
        // If we have a previous group, add it
        if (currentAssistantMessages.length > 0) {
          groups.push({
            role: "assistant",
            messages: currentAssistantMessages,
          });
          currentAssistantMessages = [];
        }
        if (currentUserMessage) {
          groups.push({
            role: "user",
            messages: [currentUserMessage],
          });
        }
        currentUserMessage = message;
      } else {
        // If this is the first assistant message after a user message
        if (currentUserMessage) {
          groups.push({
            role: "user",
            messages: [currentUserMessage],
          });
          currentUserMessage = null;
        }
        currentAssistantMessages.push(message);
      }
    });

    // Add any remaining messages
    if (currentAssistantMessages.length > 0) {
      groups.push({
        role: "assistant",
        messages: currentAssistantMessages,
      });
    }
    if (currentUserMessage) {
      groups.push({
        role: "user",
        messages: [currentUserMessage],
      });
    }

    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col md:h-[98dvh] h-[90vh] w-full relative overflow-x-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden pb-20"
      >
        <div className="space-y-4 px-4 py-2">
          {messageGroups.map((group, index) => {
            // Render single messages (like welcome message) normally
            if (group.messages.length === 1 && !group.messages[0].type) {
              return (
                <MessageBubble
                  key={index}
                  message={group.messages[0]}
                />
              );
            }

            // Render grouped messages using JobMessageGroup
            return (
              <JobMessageGroup
                key={index}
                messages={group.messages}
                isUserMessage={group.role === "user"}
              />
            );
          })}
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div
        className={`fixed bottom-0 inset-x-0 md:right-0 md:left-[16rem] md:mr-5 transition-colors duration-200 md:rounded ${
          !isAtBottom ? "bg-zinc-900" : ""
        }`}
      >
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onReset={handleResetHistory}
        />
      </div>
    </div>
  );
}
