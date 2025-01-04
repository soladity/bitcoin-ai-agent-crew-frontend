"use client";

import React, { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Loader2, RotateCcw, Send, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AgentSelector } from "./agent-selector";

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isConnected: boolean;
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onReconnect: () => void;
  onScrollToBottom?: () => void;
  isScrollButtonDisabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  isConnected,
  selectedAgentId,
  onSelectAgent,
  onSubmit,
  onReset,
  onReconnect,
  onScrollToBottom,
  isScrollButtonDisabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);
  
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-4 p-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="relative flex h-3 w-3">
              {isConnected ? (
                <span className="absolute inline-flex h-full w-full animate-none rounded-full bg-green-400 opacity-75"></span>
              ) : (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isConnected ? "Connected" : "Disconnected"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex-1 flex items-center gap-4">
        <AgentSelector selectedAgentId={selectedAgentId} onSelect={onSelectAgent} />
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading || !isConnected}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        {onScrollToBottom && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  disabled={isScrollButtonDisabled}
                  onClick={onScrollToBottom}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scroll to bottom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={onReset}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!isConnected && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={onReconnect}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reconnect</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Button type="submit" size="icon" disabled={isLoading || !isConnected}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};
