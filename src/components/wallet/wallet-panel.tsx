"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Check, X, Wallet } from "lucide-react";
import { useWalletStore } from "@/store/wallet";
import { useSessionStore } from "@/store/session";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNextStep } from "nextstepjs";

interface WalletPanelProps {
  onClose?: () => void;
}

export function WalletPanel({ onClose }: WalletPanelProps) {
  const { balances, userWallet, agentWallets, isLoading, error, fetchWallets } =
    useWalletStore();
  const { userId } = useSessionStore();
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
    if (userId) {
      fetchWallets(userId);
    }
  }, [userId, fetchWallets]);

  const formatBalance = (balance: string) => {
    return (Number(balance) / 1_000_000).toFixed(6); // Convert from microSTX to STX
  };

  // Filter out wallets of archived agents
  const activeAgentWallets = agentWallets.filter(
    (wallet) => !wallet.agent?.is_archived
  );

  const { startNextStep } = useNextStep();

  const handleStartMainTour = () => {
    startNextStep("mainTour");
  };

  return (
    <div className="h-full flex flex-col w-full md:max-w-sm">
      <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <h2 className="text-lg font-medium text-white">Wallets</h2>
        <Button onClick={handleStartMainTour}>Start Tour</Button>
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
            <>
              {/* Display user wallet first */}
              {userWallet && (
                <div
                  className="bg-zinc-800/50 rounded-lg p-4 space-y-3"
                  id="step5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-800/40">
                      <Wallet className="h-4 w-4 text-zinc-500" />
                    </div>
                    <span className="text-sm font-medium text-white">
                      My Wallet
                    </span>
                  </div>
                  {userWallet.testnet_address ? (
                    <button
                      onClick={() =>
                        copyToClipboard(userWallet.testnet_address!)
                      }
                      className="w-full flex items-center justify-between text-xs text-zinc-500 font-mono hover:text-zinc-300 transition-colors group"
                    >
                      <span>{truncateAddress(userWallet.testnet_address)}</span>
                      <span className="text-zinc-600 group-hover:text-zinc-400">
                        {copiedAddress === userWallet.testnet_address ? (
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

                  {userWallet.testnet_address &&
                    balances[userWallet.testnet_address] && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-4">
                          <span className="text-sm text-zinc-400 min-w-[80px]">
                            STX Balance
                          </span>
                          <span className="text-white font-medium text-right">
                            {formatBalance(
                              balances[userWallet.testnet_address].stx.balance
                            )}{" "}
                            STX
                          </span>
                        </div>

                        {Object.entries(
                          balances[userWallet.testnet_address].fungible_tokens
                        ).map(([tokenId, token]) => {
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
                        })}

                        {Object.entries(
                          balances[userWallet.testnet_address]
                            .non_fungible_tokens
                        ).map(([tokenId, token]) => {
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
                        })}
                      </div>
                    )}
                </div>
              )}

              {/* Display active agent wallets below */}
              <div id="step6">
                {activeAgentWallets.map((wallet) => {
                  const walletBalance = wallet.testnet_address
                    ? balances[wallet.testnet_address]
                    : null;
                  const address = wallet.testnet_address;
                  const isCopied = address === copiedAddress;

                  return (
                    <div
                      key={wallet.id}
                      className="bg-zinc-800/50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-zinc-800/40">
                          <AvatarImage
                            src={wallet.agent?.image_url || undefined}
                          />
                          <AvatarFallback className="bg-zinc-900 text-zinc-500">
                            {wallet.agent?.name?.[0]?.toUpperCase() || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-white">
                          {wallet.agent?.name || "Agent"}
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

                          {Object.entries(
                            walletBalance.non_fungible_tokens
                          ).map(([tokenId, token]) => {
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
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
