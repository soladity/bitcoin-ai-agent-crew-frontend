"use client";

import React from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Skeleton } from "@/components/ui/skeleton";

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

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainer;
      const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
      setIsAtBottom(isBottom);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] w-screen relative overflow-x-hidden">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-20">
        <div className="space-y-4 px-4 py-2">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
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

      <div className={`fixed bottom-0 left-0 right-0 transition-colors duration-200 ${!isAtBottom ? 'bg-zinc-900' : ''}`}>
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
