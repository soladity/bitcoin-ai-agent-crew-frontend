"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check, X } from "lucide-react";
import { useWalletStore } from "@/store/wallet";
import { useSessionStore } from "@/store/session";
import { useAgentsList } from "@/hooks/use-agents-list";
import { supabase } from "@/utils/supabase/client";
import { Agent, Wallet } from "@/types/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AgentWithWallet extends Agent {
  wallet?: Wallet;
}

interface WalletPanelProps {
  onClose?: () => void;
}

export function WalletPanel({ onClose }: WalletPanelProps) {
  const { agents } = useAgentsList();
  const { balances, isLoading, error, fetchBalances } = useWalletStore();
  const { userId } = useSessionStore();
  const [agentsWithWallets, setAgentsWithWallets] = useState<AgentWithWallet[]>(
    []
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const truncateAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 10) return address;
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  useEffect(() => {
    const fetchWallets = async () => {
      if (agents.length > 0) {
        const userAgents = agents.filter(
          (agent) => agent.profile_id === userId
        );

        // Fetch wallets for all user's agents
        const { data: walletsData, error: walletsError } = await supabase
          .from("wallets")
          .select("*")
          .in(
            "agent_id",
            userAgents.map((agent) => agent.id)
          );

        if (walletsError) {
          console.error("Error fetching wallets:", walletsError);
          return;
        }

        // Combine agents with their wallets
        const agentsWithWallets = userAgents.map((agent) => ({
          ...agent,
          wallet: walletsData?.find((wallet) => wallet.agent_id === agent.id),
        }));

        setAgentsWithWallets(agentsWithWallets);

        // Fetch balances for agents with testnet addresses
        const testnetAddresses = walletsData
          ?.map((wallet) => wallet.testnet_address)
          .filter((address): address is string => address !== null);

        if (testnetAddresses && testnetAddresses.length > 0) {
          fetchBalances(testnetAddresses);
        }
      }
    };

    fetchWallets();
  }, [agents, userId, fetchBalances]);

  const formatBalance = (balance: string) => {
    return (Number(balance) / 1_000_000).toFixed(6); // Convert from microSTX to STX
  };

  return (
    <div className="h-full flex flex-col w-full md:max-w-sm">
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <h2 className="text-lg font-medium text-white">Wallet</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-zinc-400 md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-sm text-zinc-400">Loading balances...</div>
          ) : error ? (
            <div className="text-sm text-red-400">{error}</div>
          ) : (
            agentsWithWallets.map((agent) => {
              const walletBalance = agent.wallet?.testnet_address
                ? balances[agent.wallet.testnet_address]
                : null;
              const address = agent.wallet?.testnet_address;
              const isCopied = address === copiedAddress;

              return (
                <div
                  key={agent.id}
                  className="bg-zinc-800/50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-zinc-800/40">
                      <AvatarImage src={agent.image_url || undefined} />
                      <AvatarFallback className="bg-zinc-900 text-zinc-500">
                        {agent.name?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-white">
                      {agent.name}
                    </span>
                  </div>
                  {address ? (
                    <button
                      onClick={() => copyToClipboard(address)}
                      className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono hover:text-zinc-300 transition-colors group"
                    >
                      <span>{truncateAddress(address)}</span>
                      <span className="text-zinc-600 group-hover:text-zinc-400">
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="text-xs text-zinc-500 font-mono">
                      No wallet address
                    </div>
                  )}

                  {walletBalance && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm text-zinc-400 min-w-[80px]">
                          STX Balance
                        </span>
                        <span className="text-white font-medium text-right">
                          {formatBalance(walletBalance.stx.balance)} STX
                        </span>
                      </div>

                      {Object.entries(walletBalance.fungible_tokens).map(
                        ([tokenId, token]) => {
                          const [, tokenSymbol] = tokenId.split("::");
                          return (
                            <div
                              key={tokenId}
                              className="flex justify-between items-center gap-4"
                            >
                              <span className="text-sm text-zinc-400 min-w-[80px]">
                                {tokenSymbol || "Token"}
                              </span>
                              <span className="text-white font-medium text-right">
                                {formatBalance(token.balance)}
                              </span>
                            </div>
                          );
                        }
                      )}

                      {Object.entries(walletBalance.non_fungible_tokens).map(
                        ([tokenId, token]) => {
                          const [, tokenSymbol] = tokenId.split("::");
                          return (
                            <div
                              key={tokenId}
                              className="flex justify-between items-center gap-4"
                            >
                              <span className="text-sm text-zinc-400 min-w-[80px]">
                                {tokenSymbol || "NFT"}
                              </span>
                              <span className="text-white font-medium text-right">
                                {token.count} items
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
