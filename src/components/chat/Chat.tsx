"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Bot } from "lucide-react";

export default function Chat() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    handleResetHistory,
    messagesEndRef,
    isConnected,
  } = useChat();

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesEndRef]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Handle scroll events to show/hide button
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      console.log({
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceFromBottom,
      });
      setShowScrollButton(distanceFromBottom > 100);
    };

    // Initial check
    handleScroll();

    // Add scroll event listener
    container.addEventListener("scroll", handleScroll);

    // Add resize event listener to window
    window.addEventListener("resize", handleScroll);

    // Add mutation observer to detect content changes
    const observer = new MutationObserver(handleScroll);
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative flex flex-col h-[98-dvh] overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth relative"
        style={{
          height: "calc(100vh - 8rem)",
          maxHeight: "calc(100vh - 8rem)",
        }}
      >
        <div className="space-y-4 px-4 py-2">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex mb-4 justify-start">
              <div className="flex flex-col max-w-[80%] p-4 rounded-2xl bg-gradient-to-br from-blue-600/90 to-blue-700/90 text-white animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-300" />
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full bg-blue-300/80 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-blue-300/80 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-blue-300/80 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-blue-300/20 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-blue-300/20 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-blue-300/20 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 mx-4 lg:mx-0 lg:left-[17rem] lg:right-4 mb-0 md:mb-4">
        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          isConnected={isConnected}
          onSubmit={handleSubmit}
          onReset={handleResetHistory}
          onScrollToBottom={scrollToBottom}
          isScrollButtonDisabled={!showScrollButton}
        />
      </div>
    </div>
  );
}
