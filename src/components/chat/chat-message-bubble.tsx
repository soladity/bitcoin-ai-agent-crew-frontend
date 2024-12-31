"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Terminal, 
  Code, 
  ChevronDown, 
  ChevronUp,
  User,
  Bot,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const [showToolInfo, setShowToolInfo] = useState(false);

  const getTypeIcon = () => {
    switch (message.type?.toLowerCase()) {
      case 'step':
        return <Wrench className="w-4 h-4 text-emerald-300" />;
      case 'result':
        return <CheckCircle2 className="w-4 h-4 text-sky-300" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-300" />;
      case 'loading':
        return <Loader2 className="w-4 h-4 text-yellow-300 animate-spin" />;
      default:
        return null;
    }
  };

  const renderToolInfo = () => {
    if (!message.tool) return null;

    return (
      <div className="mt-4 space-y-2 bg-black/10 backdrop-blur-sm p-3 rounded-lg transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-2 text-xs font-mono text-white/90">
          <Terminal className="w-4 h-4" />
          <span className="font-medium">{message.tool}</span>
        </div>
        {message.tool_input && (
          <div className="text-xs font-mono space-y-1">
            <div className="flex items-center gap-2 text-white/90">
              <Code className="w-4 h-4" />
              <span className="font-medium">Input</span>
            </div>
            <pre className="p-2 bg-black/20 rounded-lg overflow-x-auto">
              {message.tool_input}
            </pre>
          </div>
        )}
        {message.result && (
          <div className="text-xs font-mono space-y-1">
            <div className="flex items-center gap-2 text-white/90">
              <Code className="w-4 h-4" />
              <span className="font-medium">Output</span>
            </div>
            <pre className="p-2 bg-black/20 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {message.result}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        {message.role === 'user' ? (
          <User className="w-4 h-4 text-orange-300" />
        ) : (
          <Bot className="w-4 h-4 text-blue-300" />
        )}
        {getTypeIcon()}
      </div>

      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        className="text-sm prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:rounded-lg"
        disallowedElements={["img"]}
      >
        {message.content}
      </ReactMarkdown>
      
      {message.tool && (
        <button 
          onClick={() => setShowToolInfo(!showToolInfo)}
          className="mt-3 flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors duration-200"
        >
          {showToolInfo ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show details
            </>
          )}
        </button>
      )}
      
      {showToolInfo && renderToolInfo()}
      
      <div className="flex items-center gap-1 text-xs mt-3 text-white/70">
        <Clock className="w-3 h-3" />
        {message.timestamp?.toLocaleString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </>
  );

  return (
    <div
      className={cn(
        "flex mb-4 animate-in slide-in-from-bottom duration-300",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] p-4 rounded-2xl shadow-lg break-words backdrop-blur-sm",
          message.role === "user"
            ? "bg-gradient-to-br from-orange-500/90 to-orange-600/90 text-white"
            : "bg-gradient-to-br from-blue-600/90 to-blue-700/90 text-white"
        )}
      >
        {content}
      </div>
    </div>
  );
};
