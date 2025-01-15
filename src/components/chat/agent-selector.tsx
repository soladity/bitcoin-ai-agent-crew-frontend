import * as React from "react";
import { useState, useEffect } from "react";
import { Bot, Copy, Check, ExternalLink } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import dynamic from "next/dynamic";

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
  disabled,
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

  const getWalletAddress = (wallet: any) => {
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
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-background/50 backdrop-blur-sm">
        <Bot className="h-4 w-4 animate-pulse text-foreground/50" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 w-11 rounded-full p-0 hover:bg-background/80"
        >
          {selectedAgentId ? (
            <AgentAvatar
              agent={activeAgents.find((a) => a.id === selectedAgentId)}
              className="h-11 w-11"
            />
          ) : (
            <Bot className="h-5 w-5 text-foreground/50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[320px]">
        {/* User Wallet Section */}
        {userWallet && (
          <>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-foreground/50" />
                  <span className="font-medium">My Wallet</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {balances[getWalletAddress(userWallet)]?.stx?.balance &&
                    `${formatBalance(
                      balances[getWalletAddress(userWallet)].stx.balance
                    )} STX`}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <code>{truncateAddress(getWalletAddress(userWallet))}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0"
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

        {/* Agents Section */}
        {activeAgents.map((agent) => {
          const wallet = agentWallets.find((w) => w.agent_id === agent.id);
          const walletAddress = wallet ? getWalletAddress(wallet) : null;
          const balance = walletAddress
            ? balances[walletAddress]?.stx?.balance
            : null;

          return (
            <DropdownMenuItem
              key={agent.id}
              className="flex flex-col items-stretch p-3"
              onSelect={(e) => {
                e.preventDefault();
                onSelect(agent.id);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AgentAvatar agent={agent} className="h-8 w-8" />
                  <div className="flex flex-col">
                    <span className="font-medium">{agent.name}</span>
                    {walletAddress && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <code>{truncateAddress(walletAddress)}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
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

              <div className="mt-2 flex items-center gap-2">
                {walletAddress && (
                  <>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="STX amount"
                        value={stxAmounts[walletAddress] || ""}
                        onChange={(e) =>
                          handleAmountChange(walletAddress, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 text-sm"
                      />
                    </div>
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
                  </>
                )}
                <Link
                  href={`/agents/${agent.id}`}
                  className="inline-flex h-8 items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AgentAvatar({
  agent,
  className = "",
}: {
  agent?: any;
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
      <img
        src={agent.image_url}
        alt={agent.name}
        className="h-full w-full object-cover"
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
