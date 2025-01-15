import * as React from "react";
import { useState, useEffect } from "react";
import { Bot, Copy, Check, ExternalLink, Plus } from "lucide-react";
import { useAgents } from "@/hooks/use-agents";
import { useWalletStore } from "@/store/wallet";
import { useSessionStore } from "@/store/session";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Agent, Wallet } from "@/types/supabase";

// Dynamically import Stacks components
const StacksComponents = dynamic(() => import("../wallet/stacks-component"), {
  ssr: false,
});

interface AgentWalletSelectorProps {
  selectedAgentId: string | null;
  onSelect: (value: string | null) => void;
  disabled?: boolean;
}

export function AgentWalletSelector({
  selectedAgentId,
  onSelect,
}: AgentWalletSelectorProps) {
  const { agents, loading: agentsLoading } = useAgents();
  const {
    balances,
    userWallet,
    agentWallets,
    isLoading: walletsLoading,
    fetchWallets,
  } = useWalletStore();
  const { userId } = useSessionStore();
  const { toast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [stxAmounts, setStxAmounts] = useState<{ [key: string]: string }>({});

  // Filter out archived agents
  const activeAgents = agents.filter((agent) => !agent.is_archived);

  useEffect(() => {
    if (userId) {
      fetchWallets(userId);
    }
  }, [userId, fetchWallets]);

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: `Error: ${error}`,
        variant: "destructive",
      });
    }
  };

  const formatBalance = (balance: string) => {
    return (Number(balance) / 1_000_000).toFixed(6);
  };

  const getWalletAddress = (wallet: Wallet) => {
    return process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
      ? wallet.mainnet_address
      : wallet.testnet_address;
  };

  const handleAmountChange = (address: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setStxAmounts((prev) => ({ ...prev, [address]: value }));
    }
  };

  if (agentsLoading || walletsLoading) {
    return (
      <div className="flex h-11 w-auto items-center justify-center rounded-full bg-background/50 backdrop-blur-sm px-4">
        <Bot className="h-4 w-4 animate-pulse text-foreground/50 mr-2" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  const selectedAgent = activeAgents.find((a) => a.id === selectedAgentId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="max-w-[200px]">
          {selectedAgent ? (
            <div className="flex items-center overflow-hidden">
              <AgentAvatar
                agent={selectedAgent}
                className="h-8 w-8 min-w-8 mr-2"
              />
              <span className="text-sm font-medium truncate">
                {selectedAgent.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center">
              <Bot className="h-5 w-5 text-foreground/50 mr-2" />
              <span className="text-sm font-medium">Assistant Agent</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(400px,calc(100vw-2rem))] max-h-[min(600px,calc(100vh-4rem))] overflow-y-auto"
      >
        {/* User Wallet Section */}
        {userWallet && (
          <>
            <div className="p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Bot className="h-5 w-5 text-foreground/50" />
                  <span className="font-medium">Assistant Wallet</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {balances[getWalletAddress(userWallet)]?.stx?.balance &&
                    `${formatBalance(
                      balances[getWalletAddress(userWallet)].stx.balance
                    )} STX`}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <code className="break-all">
                  {truncateAddress(getWalletAddress(userWallet))}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 flex-shrink-0"
                  onClick={() => copyToClipboard(getWalletAddress(userWallet))}
                >
                  {copiedAddress === getWalletAddress(userWallet) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Create New Agent Button */}
        {activeAgents.length === 0 && (
          <div className="p-3">
            <Link href="/agents/new" className="block">
              <Button className="w-full" variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Create New Agent
              </Button>
            </Link>
          </div>
        )}

        {/* Agents Section */}
        {activeAgents.length > 0 && (
          <div className="overflow-y-auto">
            {activeAgents.map((agent) => {
              const wallet = agentWallets.find((w) => w.agent_id === agent.id);
              const walletAddress = wallet ? getWalletAddress(wallet) : null;
              const balance = walletAddress
                ? balances[walletAddress]?.stx?.balance
                : null;

              return (
                <DropdownMenuItem
                  key={agent.id}
                  className="flex flex-col items-stretch p-3 cursor-pointer hover:bg-black focus:bg-gray/100"
                  onSelect={(e) => {
                    e.preventDefault();
                    onSelect(agent.id);
                  }}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <AgentAvatar agent={agent} className="h-8 w-8" />
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[150px]">
                          {agent.name}
                        </span>
                        {walletAddress && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <code className="break-all">
                              {truncateAddress(walletAddress)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(walletAddress);
                              }}
                            >
                              {copiedAddress === walletAddress ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {balance && (
                      <span className="text-sm text-muted-foreground">
                        {formatBalance(balance)} STX
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {walletAddress && (
                      <div className="flex-1 min-w-[200px]">
                        <StacksComponents
                          address={walletAddress}
                          amount={stxAmounts[walletAddress] || ""}
                          onAmountChange={(value) =>
                            handleAmountChange(walletAddress, value)
                          }
                          onToast={(title, description, variant) =>
                            toast({ title, description, variant })
                          }
                        />
                      </div>
                    )}
                    <Link
                      href={`/agents/${agent.id}`}
                      className="inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        className="h-8 px-3 flex items-center gap-2"
                      >
                        <span className="text-sm">Manage</span>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AgentAvatar({
  agent,
  className = "",
}: {
  agent?: Agent;
  className?: string;
}) {
  if (!agent?.image_url) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-background ${className}`}
      >
        <Bot className="h-5 w-5 text-foreground/50" />
      </div>
    );
  }

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`}>
      <Image
        src={agent.image_url || "/placeholder.svg"}
        alt={agent.name}
        height={24}
        width={24}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <span className="text-lg font-bold text-white">
          {agent.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default AgentWalletSelector;
