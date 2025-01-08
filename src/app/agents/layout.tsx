import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Store | AI BTC Dev",
  description:
    "Discover and deploy AI agents for your blockchain development needs",
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col bg-background">
      <div className="flex-1 relative w-full">
        {/* Subtle gradient background */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-background to-muted/20 pointer-events-none"
          aria-hidden="true"
        />
        {/* Main content */}
        <div className="relative h-full w-full">{children}</div>
      </div>
    </main>
  );
}
