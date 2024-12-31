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

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isConnected: boolean;
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              ) : null}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-sky-500' : 'bg-gray-400'}`}></span>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isConnected ? 'Connected' : 'Disconnected'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {!isConnected && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onReconnect}
                type="button"
                variant="outline"
                className="h-10 w-10 p-0 rounded-md font-medium focus:ring-2 focus:ring-offset-2"
              >
                <RefreshCw className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reconnect</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onReset}
              type="button"
              variant="destructive"
              className="h-10 w-10 p-0 rounded-md text-white font-medium hover:bg-red-600/90 focus:ring-2 focus:ring-offset-2"
            >
              <RotateCcw className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset conversation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1 h-11 rounded-md border px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
        style={{ WebkitAppearance: "none" }}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10 w-10 p-0 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Send className="h-8 w-8" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isLoading ? 'Processing...' : 'Send message'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={isScrollButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
              <Button
                type="button"
                onClick={onScrollToBottom}
                disabled={isScrollButtonDisabled}
                className="h-10 w-10 p-0 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <ArrowDownToLine className="h-8 w-8" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isScrollButtonDisabled ? 'Already at bottom' : 'Scroll to bottom'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  );
};
