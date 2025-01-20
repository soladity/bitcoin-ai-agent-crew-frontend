"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useSessionStore } from "@/store/session";
import { useChatStore } from "@/store/chat";
import { useThreadsStore } from "@/store/threads";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export function ThreadList({
  setLeftPanelOpen,
}: {
  setLeftPanelOpen?: (open: boolean) => void;
}) {
  const { userId } = useSessionStore();
  const { setActiveThread, activeThreadId } = useChatStore();
  const {
    threads,
    isLoading: loading,
    fetchThreads,
    updateThread,
  } = useThreadsStore();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  // Group threads by date
  const groupedThreads = useMemo(() => {
    const groups: { [key: string]: typeof threads } = {};

    threads.forEach((thread) => {
      const date = new Date(thread.created_at);
      let dateKey;

      if (isToday(date)) {
        dateKey = "Today";
      } else if (isYesterday(date)) {
        dateKey = "Yesterday";
      } else {
        dateKey = format(date, "MMMM d, yyyy");
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(thread);
    });

    return groups;
  }, [threads]);

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

  const startEditing = (
    e: React.MouseEvent,
    threadId: string,
    currentTitle: string
  ) => {
    e.stopPropagation();
    setEditingId(threadId);
    setEditedTitle(currentTitle || "");
  };

  const handleSubmit = async (threadId: string) => {
    if (editedTitle.trim()) {
      await updateThread(threadId, { title: editedTitle.trim() });
    }
    setEditingId(null);
    setEditedTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, threadId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(threadId);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditedTitle("");
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-2 border-t border-zinc-800/50" id="step2">
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Recent Chats
          </h3>
        </div>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-4 pr-2">
            {loading ? (
              <div className="px-3 py-2 text-sm text-zinc-500">Loading...</div>
            ) : threads.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">
                No chats yet
              </div>
            ) : (
              Object.entries(groupedThreads).map(([date, dateThreads]) => (
                <div key={date} className="space-y-1">
                  <h4 className="px-3 py-1 text-s font-extrabold">{date}</h4>
                  {dateThreads.map((thread) => (
                    <Button
                      key={thread.id}
                      variant="ghost"
                      className={`w-full justify-between hover:bg-zinc-800/50 hover:text-white group relative ${
                        thread.id === activeThreadId
                          ? "bg-zinc-800/50 text-white"
                          : "text-zinc-400"
                      }`}
                      onClick={() => handleThreadClick(thread.id)}
                    >
                      <div className="flex flex-1 items-center justify-between pr-2">
                        {editingId === thread.id ? (
                          <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onBlur={() => handleSubmit(thread.id)}
                            onKeyDown={(e) => handleKeyDown(e, thread.id)}
                            className="bg-zinc-900 text-white px-2 py-1 rounded w-full text-sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-sm truncate">
                            {thread.title || "Untitled Thread"}
                          </span>
                        )}
                      </div>
                      {!editingId && (
                        <p
                          onClick={(e) =>
                            startEditing(e, thread.id, thread.title)
                          }
                          className="opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-opacity ml-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </p>
                      )}
                    </Button>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default ThreadList;
