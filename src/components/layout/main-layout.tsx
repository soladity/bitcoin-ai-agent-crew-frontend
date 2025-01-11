"use client";

import * as React from "react";
import { Bot, Plus, ChevronRight, Menu, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Mobile Navigation Bar */}
      <div className=" md:hidden h-14 px-4 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-900/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="text-zinc-400"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <span className="text-lg font-medium text-white">Griffain</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="text-zinc-400"
        >
          <Wallet className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside
          className={cn(
            // Base styles
            "bg-zinc-900/50 border-r border-zinc-800/50",
            // Desktop styles
            "hidden md:block md:w-64",
            // Mobile styles
            "fixed md:relative inset-y-0 left-0 w-[75%] z-20",
            leftPanelOpen && "block"
          )}
        >
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <span className="text-lg font-medium text-white">Griffain</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white hidden md:flex"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Thread
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftPanelOpen(false)}
                className="text-zinc-400 md:hidden"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Recent Threads */}
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-between text-zinc-400 hover:bg-zinc-800/50 hover:text-white group"
              >
                <span>Recent Thread 1</span>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Right Wallet Panel */}
        <aside
          className={cn(
            // Base styles
            "bg-zinc-900/50 border-l border-zinc-800/50",
            // Desktop styles
            "hidden md:block md:w-80",
            // Mobile styles
            "fixed md:relative inset-y-0 right-0 w-[75%] z-20",
            rightPanelOpen && "block"
          )}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
              <h2 className="text-lg font-medium text-white">Wallet</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelOpen(false)}
                className="text-zinc-400 md:hidden"
              >
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-zinc-800/50">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Balance</span>
                    <span className="text-white font-medium">0.0023 BTC</span>
                  </div>
                  <div className="text-xs text-zinc-500">bc1q...xyz</div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">
                  Tokens
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm">T</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          Token Name
                        </div>
                        <div className="text-xs text-zinc-400">0.001 BTC</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile when panels are open */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 md:hidden transition-opacity z-10",
            leftPanelOpen || rightPanelOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          )}
          onClick={() => {
            setLeftPanelOpen(false);
            setRightPanelOpen(false);
          }}
        />
      </div>
    </div>
  );
}
