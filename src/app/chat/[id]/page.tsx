"use client";

import { ChatWindow } from "@/components/chat/chat-window";

interface ChatPageProps {
  params: {
    id: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return (
    <div className="h-full">
      <ChatWindow conversationId={params.id} />
    </div>
  );
}
