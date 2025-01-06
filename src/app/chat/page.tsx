"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";

export default function ChatPage() {
  const router = useRouter();
  const { addConversation, setActiveConversation } = useChatStore();
  const { accessToken } = useSessionStore();

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const newConversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      agent_id: null,
    };

    addConversation(newConversation);
    setActiveConversation(newConversation.id);
    router.push(`/chat/${newConversation.id}`);
  }, [router, addConversation, setActiveConversation, accessToken]);

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500">Please sign in to start chatting</div>
      </div>
    );
  }

  return null;
}
