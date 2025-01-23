"use client";

import { Button } from "@/components/ui/button";
import { useThreads } from "@/hooks/use-threads";
import { useSessionStore } from "@/store/session";
import { useChatStore } from "@/store/chat";
import { useThreadsStore } from "@/store/threads";
import { MessageSquarePlusIcon } from "lucide-react";

interface CreateThreadButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "link";
  id?: string;
}

export function CreateThreadButton({
  className = "w-full bg-blue-600 hover:bg-blue-500 text-white",
  id = "step3",
  variant = "default",
}: CreateThreadButtonProps) {
  const { createThread } = useThreads();
  const { userId } = useSessionStore();
  const { setActiveThread, activeThreadId } = useChatStore();

  const handleNewThread = async () => {
    if (userId) {
      const thread = await createThread(userId);
      if (thread) {
        useThreadsStore.getState().addThread(thread);
        setActiveThread(thread.id);
      }
    }
  };

  return (
    <Button
      className={className}
      variant={variant}
      onClick={handleNewThread}
      id={id}
    >
      <MessageSquarePlusIcon className="h-5 w-5" />
      {!activeThreadId && <span className="ml-2">New Chat</span>}
    </Button>
  );
}
