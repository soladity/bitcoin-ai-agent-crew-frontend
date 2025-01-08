"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

export function WalletPanel() {
  return (
    <aside className="w-80 flex flex-col bg-zinc-900/50 border-l border-zinc-800/50">
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

      <ScrollArea className="flex-1">
        <div className="p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Tokens</h3>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
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
            ))}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
