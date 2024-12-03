"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ChevronDoubleDownIcon, ArrowUpCircleIcon, TrashIcon } from "@heroicons/react/24/solid";

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isConnected: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
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
  onScrollToBottom,
  isScrollButtonDisabled = false,
}) => (
  <form onSubmit={onSubmit} className="flex items-center gap-4 p-4">
    <span className="relative flex h-3 w-3">
      {isConnected ? (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
      ) : null}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-sky-500' : 'bg-gray-400'}`}></span>
    </span>
    <Button
      onClick={onReset}
      type="button"
      variant="destructive"
      className="h-10 w-10 p-0 rounded-md text-white font-medium hover:bg-red-600/90 focus:ring-2 focus:ring-offset-2"
    >
      <TrashIcon className="h-8 w-8" />
    </Button>
    <Input
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Type your message..."
      disabled={isLoading}
      className="flex-1 h-11 rounded-md border px-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
      style={{ WebkitAppearance: "none" }}
    />
    <Button
      type="submit"
      disabled={isLoading}
      className="h-10 w-10 p-0 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <ArrowUpCircleIcon className="h-8 w-8" />
      )}
    </Button>
    <Button
      type="button"
      onClick={onScrollToBottom}
      disabled={isScrollButtonDisabled}
      className="h-10 w-10 p-0 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      <ChevronDoubleDownIcon className="h-8 w-8" />
    </Button>
  </form>
);
