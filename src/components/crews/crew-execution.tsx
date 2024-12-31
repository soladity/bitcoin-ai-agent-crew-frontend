"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCrewChat } from "@/hooks/use-crew-chat";
import { MessageBubble } from "../chat/chat-message-bubble";
import { Skeleton } from "../ui/skeleton";
import { ChatInput } from "../chat/chat-input";
import { useEffect, useCallback } from "react";

interface ExecutionPanelProps {
  crewName: string;
  crewId: number;
}

export default function ExecutionPanel({ crewId }: ExecutionPanelProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    messagesEndRef,
    handleResetHistory,
    setCrewId,
    isConnected,
  } = useCrewChat();

  const memoizedSetCrewId = useCallback(
    (id: number) => {
      setCrewId(id);
    },
    [setCrewId]
  );

  useEffect(() => {
    memoizedSetCrewId(crewId);
  }, [crewId, memoizedSetCrewId]);

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4">
        <div className="h-[50vh] overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          isConnected={isConnected}
          onSubmit={handleSubmit}
          onReset={handleResetHistory}
          onReconnect={() => {}}
          onScrollToBottom={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          isScrollButtonDisabled={isLoading}
        />
      </CardContent>
    </Card>
  );
}
