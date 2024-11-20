"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface JobMessage {
  type: "user" | "step" | "task" | "result";
  role: string;
  content: string;
  timestamp: string;
  thought?: string;
  result?: string;
  tool?: string;
  tool_input?: string;
  crew_id?: number;
}

interface JobBubbleProps {
  message: JobMessage;
}

export const JobBubble: React.FC<JobBubbleProps> = ({ message }) => {
  const renderContent = () => {
    switch (message.type) {
      case "user":
        return (
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-sm">User Input</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
                {message.content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        );
      case "step":
      case "task":
        return (
          <Card
            className={cn(
              message.type === "step"
                ? "bg-gray-900 text-white"
                : "bg-yellow-50"
            )}
          >
            <CardHeader>
              <CardTitle className="text-sm">
                {message.type === "step" ? "Step" : "Task"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="content" className="border-none">
                  <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                    View Details
                  </AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                    {message.thought && (
                      <div className="mt-2">
                        <strong>Thought:</strong> {message.thought}
                      </div>
                    )}
                    {message.tool && (
                      <div className="mt-2">
                        <strong>Tool:</strong> {message.tool}
                      </div>
                    )}
                    {message.tool_input && (
                      <div className="mt-2">
                        <strong>Tool Input:</strong> {message.tool_input}
                      </div>
                    )}
                    {message.result && (
                      <div className="mt-2">
                        <strong>Result:</strong> {message.result}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      case "result":
        return (
          <Card className="bg-secondary text-secondary-foreground">
            <CardHeader>
              <CardTitle className="text-sm">Result</CardTitle>
            </CardHeader>
            <CardContent>
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
                {message.content}
              </ReactMarkdown>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-4">
      {renderContent()}
      <div className="text-xs mt-2 text-muted-foreground">
        {new Date(message.timestamp).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
};
