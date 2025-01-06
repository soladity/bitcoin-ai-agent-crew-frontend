"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, Plus, ChevronRight, Users, MessageSquare, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WalletPanel } from "@/components/wallet/wallet-panel";
import { ThreadList } from "@/components/threads/thread-list";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Collectives", href: "/collectives", icon: Boxes },
];

export default function ApplicationLayout({ children }: ApplicationLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Left Sidebar */}
      <aside className="w-64 flex flex-col bg-zinc-900/50">
        {/* Header */}
        <div className="h-14 px-4 flex items-center border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-medium text-white">AIBTCDEV</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-zinc-800/50 text-white"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Thread List */}
        <ThreadList />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 relative">
        <ScrollArea className="h-screen">
          <div>
            {children}
          </div>
        </ScrollArea>
      </main>

      {/* Right Wallet Panel */}
      <WalletPanel />
    </div>
  );
}
