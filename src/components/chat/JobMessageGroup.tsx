"use client";

import React from "react";
import { Message } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface JobMessageGroupProps {
  messages: Message[];
  isUserMessage?: boolean;
}

export const JobMessageGroup: React.FC<JobMessageGroupProps> = ({
  messages,
  isUserMessage = false,
}) => {
  const [openSections, setOpenSections] = React.useState<string[]>(["results"]);

  if (messages.length === 0) return null;

  // For user messages, just show them as is
  if (isUserMessage) {
    return (
      <div className="flex mb-4 justify-end">
        <div className="max-w-[70%] p-4 rounded-lg shadow-sm bg-orange-500 text-white">
          <div className="space-y-2">
            {messages.map((message, index) => (
              <div key={index} className="text-sm">
                {message.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For assistant messages, group them by type
  const steps = messages.filter((m) => m.type === "step");
  const tasks = messages.filter((m) => m.type === "task");
  const results = messages.filter((m) => m.type === "result");
  const otherMessages = messages.filter((m) => !m.type);

  const sections = [
    { id: "steps", title: "Steps", messages: steps },
    { id: "tasks", title: "Tasks", messages: tasks },
  ].filter((section) => section.messages.length > 0);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="flex mb-4 justify-start">
      <div className="max-w-[70%] space-y-4">
        {otherMessages.map((message, index) => (
          <div key={`other-${index}`} className="text-sm mb-2">
            {message.content}
          </div>
        ))}

        {sections.length > 0 && (
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className="rounded-lg overflow-hidden bg-blue-600 text-white"
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-3 font-medium text-left hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 gap-3"
                  onClick={() => toggleSection(section.id)}
                >
                  <span>{section.title}</span>
                  <svg
                    className={cn(
                      "w-3 h-3 shrink-0 transition-transform rotate-0",
                      openSections.includes(section.id) ? "rotate-180" : ""
                    )}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1 5 5 9 1"
                    />
                  </svg>
                </button>
                <div
                  className={cn(
                    "transition-all duration-200",
                    openSections.includes(section.id) ? "block" : "hidden"
                  )}
                >
                  <div className="p-3 space-y-2 border-t border-white/20">
                    {section.messages.map((message, index) => (
                      <div key={`${section.id}-${index}`} className="text-sm">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          className="text-sm"
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((message, index) => (
              <div
                key={`result-${index}`}
                className="rounded-lg overflow-hidden bg-blue-600 text-white p-3"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm">
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
