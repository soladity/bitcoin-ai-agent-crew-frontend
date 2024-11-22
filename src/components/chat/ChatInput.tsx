import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  isLoading,
  onSubmit,
  onReset,
}) => (
  <form onSubmit={onSubmit} className="flex items-center gap-2 p-4">
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
      className="h-10 px-4 rounded-md bg-primary text-white font-medium hover:bg-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Thinking...
        </div>
      ) : (
        "Enter"
      )}
    </Button>
    <Button
      onClick={onReset}
      variant="destructive"
      className="h-10 px-4 rounded-md text-white font-medium hover:bg-red-600 focus:ring-2 focus:ring-offset-2"
    >
      Reset
    </Button>
  </form>
);
