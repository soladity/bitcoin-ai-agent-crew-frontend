"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  type: string;
  role: string;
  content: string;
  timestamp: string;
  thought?: string;
  result?: string;
  tool?: string;
  tool_input?: string;
  crew_id?: number;
};

export default function Component({
  jobMessages = "",
}: {
  jobMessages?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (jobMessages) {
      const parsedMessages = jobMessages
        .split("}{")
        .map((msg, index, array) => {
          if (index === 0) msg = msg + "}";
          else if (index === array.length - 1) msg = "{" + msg;
          else msg = "{" + msg + "}";
          return JSON.parse(msg);
        });
      setMessages(
        parsedMessages.filter((msg) =>
          ["user", "step", "task", "result"].includes(msg.type)
        )
      );
    }
  }, [jobMessages]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case "user":
        return (
          <Card key={message.timestamp} className="mb-4 bg-blue-50">
            <CardHeader>
              <CardTitle>User Input</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{message.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {formatTimestamp(message.timestamp)}
              </p>
            </CardContent>
          </Card>
        );
      case "step":
        return (
          <Card key={message.timestamp} className="mb-4 bg-green-50">
            <CardHeader>
              <CardTitle>Step</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Content:</strong> {message.content}
              </p>
              {message.thought && (
                <p>
                  <strong>Thought:</strong> {message.thought}
                </p>
              )}
              {message.tool && (
                <p>
                  <strong>Tool:</strong> {message.tool}
                </p>
              )}
              {message.tool_input && (
                <p>
                  <strong>Tool Input:</strong> {message.tool_input}
                </p>
              )}
              {message.result && (
                <p>
                  <strong>Result:</strong> {message.result}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {formatTimestamp(message.timestamp)}
              </p>
            </CardContent>
          </Card>
        );
      case "task":
        return (
          <Card key={message.timestamp} className="mb-4 bg-yellow-50">
            <CardHeader>
              <CardTitle>Task</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{message.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {formatTimestamp(message.timestamp)}
              </p>
            </CardContent>
          </Card>
        );
      case "result":
        return (
          <Card key={message.timestamp} className="mb-4 bg-purple-50">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{message.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                {formatTimestamp(message.timestamp)}
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return <div className="space-y-4">{messages.map(renderMessage)}</div>;
}
