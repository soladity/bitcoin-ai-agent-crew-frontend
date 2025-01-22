"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useSessionStore } from "@/store/session";
import { useChatStore } from "@/store/chat";
import { useThreadsStore } from "@/store/threads";
import { useThread } from "@/hooks/use-thread";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThreadList({
  setLeftPanelOpen,
}: {
  setLeftPanelOpen?: (open: boolean) => void;
}) {
  const { userId } = useSessionStore();
  const { setActiveThread, activeThreadId, clearMessages } = useChatStore();
  const {
    threads,
    isLoading: loading,
    fetchThreads,
    updateThread,
  } = useThreadsStore();
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { clearThread } = useThread(selectedThreadId || "");

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

  const handleDelete = async () => {
    if (selectedThreadId) {
      try {
        // First clear the messages in Supabase
        await clearThread();
        // Then clear the local state
        clearMessages(selectedThreadId);

        setShowDeleteDialog(false);
        setSelectedThreadId(null);

        if (selectedThreadId === activeThreadId) {
          setActiveThread("");
        }
      } catch (error) {
        console.error("Error clearing messages:", error);
      }
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
                    <div
                      key={thread.id}
                      className={`flex items-center group ${
                        thread.id === activeThreadId
                          ? "bg-zinc-800/50 text-white"
                          : "text-zinc-400"
                      }`}
                    >
                      <Button
                        variant="ghost"
                        className={`flex-1 justify-start hover:bg-zinc-800/50 hover:text-white relative ${
                          thread.id === activeThreadId
                            ? "bg-zinc-800/50 text-white"
                            : "text-zinc-400"
                        }`}
                        onClick={() => handleThreadClick(thread.id)}
                      >
                        <div className="flex flex-1 items-center">
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
                      </Button>
                      {!editingId && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className=""
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(e, thread.id, thread.title);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedThreadId(thread.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Thread Messages</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all messages in this thread? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ThreadList;
