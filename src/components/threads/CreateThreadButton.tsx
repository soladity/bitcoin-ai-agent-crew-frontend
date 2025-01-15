"use client";

import { Button } from "@/components/ui/button";
import { useThreads } from "@/hooks/use-threads";
import { useAgents } from "@/hooks/use-agents";
import { useSessionStore } from "@/store/session";
import { useChatStore } from "@/store/chat";
import { useThreadsStore } from "@/store/threads";

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
  const { setActiveThread } = useChatStore();

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
      // disabled={agents.length === 0}
    >
      {/* <Plus className="h-4 w-4 mr-2" /> */}
      New Chat
    </Button>
  );
}
