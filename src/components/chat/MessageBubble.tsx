"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/hooks/useChat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const renderContent = () => {
    if (message.type === "step" || message.type === "task") {
      const title = message.type === "step" ? "Step" : "Task";
      return (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="content" className="border-none">
            <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
              {title}
            </AccordionTrigger>
            <AccordionContent className="text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    } else if (message.type === "result") {
      return <div className="text-sm">{message.content}</div>;
    } else {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
          {message.content}
        </ReactMarkdown>
      );
    }
  };

  return (
    <div
      className={cn(
        "flex mb-4",
        message.role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] p-4 rounded-lg shadow-sm break-words",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : message.type === "task"
            ? "bg-gray-900"
            : message.type === "result"
            ? "bg-secondary"
            : message.type === "step"
            ? "bg-gray-900"
            : "bg-muted"
        )}
      >
        {renderContent()}
        <div className="text-xs mt-2 text-muted-foreground">
          {message.timestamp.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};
