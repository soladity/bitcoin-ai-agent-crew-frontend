"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, ChevronRight } from "lucide-react";
import { useConversations } from "@/hooks/use-conversations";
import { useAgents } from "@/hooks/use-agents";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/session";

export function ThreadList() {
  const { conversations, loading, createConversation } = useConversations();
  const { agents } = useAgents();
  const { userId } = useSessionStore();
  const router = useRouter();

  const handleNewThread = async () => {
    if (agents.length > 0) {
      if (userId) {
        const conversation = await createConversation(userId);
        if (conversation) {
          router.push(`/chat/${conversation.id}`);
        }
      }
    } else {
      alert("Please create an agent first");
    }
  };

  const handleThreadClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  return (
    <div className="flex flex-col flex-1">
      {/* New Thread Button */}
      <div className="px-2 pb-2">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          onClick={handleNewThread}
          disabled={loading || agents.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Thread
        </Button>
      </div>

      {/* Recent Threads */}
      <div className="flex-1 p-2 border-t border-zinc-800/50">
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Recent Threads
          </h3>
        </div>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-1 pr-2">
            {loading ? (
              <div className="px-3 py-2 text-sm text-zinc-500">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className="w-full justify-between text-zinc-400 hover:bg-zinc-800/50 hover:text-white group"
                  onClick={() => handleThreadClick(conversation.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm">{conversation.name}</span>
                    <span className="text-xs text-zinc-500">
                      {format(new Date(conversation.created_at), "MMM d, h:mm a")}
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
