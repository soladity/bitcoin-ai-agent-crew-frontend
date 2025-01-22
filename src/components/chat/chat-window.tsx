import { useEffect, useCallback } from "react";
import { ChatInput } from "./chat-input";
import { MessageList } from "./message-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChatStore } from "@/store/chat";
import { useSessionStore } from "@/store/session";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentWalletSelector from "./agent-selector";
import { CreateThreadButton } from "../threads/CreateThreadButton";
import { StartGuide } from "../reusables/StartGuide";

export function ChatWindow() {
  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    isConnected,
    selectedAgentId,
    setSelectedAgent,
    connect,
    disconnect,
    activeThreadId,
  } = useChatStore();

  const { accessToken } = useSessionStore();

  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const memoizedConnect = useCallback(
    (token: string) => {
      connect(token);
    },
    [connect]
  );

  const memoizedDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    if (!accessToken) return;

    const connectWithDelay = () => {
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          memoizedConnect(accessToken);
        }, 100);
      } else {
        memoizedConnect(accessToken);
      }
    };

    connectWithDelay();

    return () => {
      if (process.env.NODE_ENV !== "development") {
        memoizedDisconnect();
      }
    };
  }, [accessToken, memoizedConnect, memoizedDisconnect]);

  if (!accessToken) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert>
          <AlertDescription>Please sign in to start chatting</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!activeThreadId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] backdrop-blur-sm">
        <div className="text-center space-y-4 p-4 sm:p-6 lg:p-8 -mt-20">
          <div className="flex justify-center gap-3">
            <CreateThreadButton />
            <div className="md:block hidden">
              <StartGuide />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative h-[94dvh] md:h-[100dvh] w-full min-w-0 max-w-full">
      <div className="sticky top-0 flex items-center justify-between px-2 md:px-4 h-14 border-b border-border/10 min-w-0 bg-background/80 backdrop-blur-sm w-full">
        <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div>
              <AgentWalletSelector
                selectedAgentId={selectedAgentId}
                onSelect={setSelectedAgent}
                disabled={isChatLoading || !isConnected}
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          <CreateThreadButton />
        </div>
      </div>

      <div className="flex-1 overflow-hidden w-full min-w-0 max-w-full">
        <ScrollArea className="h-full w-full pb-4">
          <div className="flex flex-col justify-end min-h-full w-full max-w-full">
            {chatError && (
              <Alert
                variant="destructive"
                className="mx-2 md:mx-4 my-2 md:my-4"
              >
                <AlertDescription>{chatError}</AlertDescription>
              </Alert>
            )}
            <MessageList messages={threadMessages} />
          </div>
        </ScrollArea>
      </div>

      <div className="sticky bottom-0 border-t border-border/10 bg-background/80 backdrop-blur-sm w-full min-w-0 pb-safe">
        <div className="px-2 md:px-4">
          <div className="relative">
            <ChatInput
              selectedAgentId={selectedAgentId}
              onAgentSelect={setSelectedAgent}
              disabled={isChatLoading || !isConnected}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
