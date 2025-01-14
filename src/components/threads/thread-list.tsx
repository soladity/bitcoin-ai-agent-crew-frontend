"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { format } from "date-fns";
import { useSessionStore } from "@/store/session";
import { useChatStore } from "@/store/chat";
import { useThreadsStore } from "@/store/threads";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreateThreadButton } from "./CreateThreadButton";

export function ThreadList({
  setLeftPanelOpen,
}: {
  setLeftPanelOpen?: (open: boolean) => void;
}) {
  const { userId } = useSessionStore();
  const { setActiveThread, activeThreadId } = useChatStore();
  const { threads, isLoading: loading, fetchThreads } = useThreadsStore();
  const router = useRouter();

  // Fetch threads when component mounts and userId changes
  useEffect(() => {
    if (userId) {
      fetchThreads(userId);
    }
  }, [userId, fetchThreads]);

  const handleThreadClick = (threadId: string) => {
    if (threadId === activeThreadId) return;
    setActiveThread(threadId);
    setLeftPanelOpen?.(false);
    router.push(`/chat`);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* New Thread Button */}
      <div className="px-2 pb-2">
        <CreateThreadButton />
      </div>

      {/* Recent Threads */}
      <div className="flex-1 p-2 border-t border-zinc-800/50" id="step2">
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Recent Threads
          </h3>
        </div>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 pr-2">
            {loading ? (
              <div className="px-3 py-2 text-sm text-zinc-500">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">
                No threads yet
              </div>
            ) : (
              threads.map((thread) => (
                <Button
                  key={thread.id}
                  variant="ghost"
                  className={`w-full justify-between hover:bg-zinc-800/50 hover:text-white group ${
                    thread.id === activeThreadId
                      ? "bg-zinc-800/50 text-white"
                      : "text-zinc-400"
                  }`}
                  onClick={() => handleThreadClick(thread.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm">
                      {thread.title || "Untitled Thread"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {format(new Date(thread.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
