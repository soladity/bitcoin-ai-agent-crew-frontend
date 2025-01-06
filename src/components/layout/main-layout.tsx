"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Left Sidebar */}
      <aside className="w-64 flex flex-col bg-zinc-900/50">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-medium text-white">Griffain</span>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">
            <Plus className="h-4 w-4 mr-1" />
            New Thread
          </Button>
        </div>

        {/* Recent Threads */}
        <div className="flex-1 p-2">
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
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Right Wallet Panel */}
      <aside className="w-80 bg-zinc-900/50 border-l border-zinc-800/50">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800/50">
            <h2 className="text-lg font-medium text-white mb-4">Wallet</h2>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Balance</span>
                <span className="text-white font-medium">0.0023 BTC</span>
              </div>
              <div className="text-xs text-zinc-500">bc1q...xyz</div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Tokens</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm">T</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Token Name</div>
                    <div className="text-xs text-zinc-400">0.001 BTC</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
