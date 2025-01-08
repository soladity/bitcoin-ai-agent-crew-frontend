"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session";
import { ChatWindow } from "@/components/chat/chat-window";

export default function ChatPage() {
  const { accessToken } = useSessionStore();

  useEffect(() => {
    if (!accessToken) {
      return;
    }
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500">Please sign in to start chatting</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatWindow />
    </div>
  );
}
