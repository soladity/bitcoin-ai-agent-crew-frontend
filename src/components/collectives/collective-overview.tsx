"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BsGlobe, BsTwitterX, BsTelegram } from "react-icons/bs";
import { Collective, Token } from "@/types/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CollectiveOverviewProps {
  collective: Collective;
  token: Token;
  treasuryTokens?: {
    type: 'FT' | 'NFT';
    name: string;
    symbol: string;
    amount: number;
    value: number;
  }[];
  marketStats?: {
    price: number;
    marketCap: number;
    treasuryBalance: number;
    holderCount: number;
  };
}

function CollectiveOverview({ 
  collective, 
  token, 
  treasuryTokens = [], 
  marketStats = {
    price: 0,
    marketCap: 0,
    treasuryBalance: 0,
    holderCount: 0
  }
}: CollectiveOverviewProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border/10 bg-[#1A1A1A] shadow-sm">
        <div className="absolute inset-0 flex items-center p-6">
          <div className="flex items-center gap-6">
            {token?.image_url && (
              <div className="relative h-24 w-24 shrink-0">
                <Image
                  src={token.image_url}
                  alt={collective.name}
                  fill
                  className="rounded-lg border-2 border-border/10 object-cover shadow-lg"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold text-foreground">{collective.name}</h1>
              <p className="text-sm text-muted-foreground">{collective.mission}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border/10 bg-[#1A1A1A] p-4">
          <div className="text-xs font-medium text-muted-foreground">Token Price</div>
          <div className="mt-1.5 text-xl font-semibold text-foreground">{formatNumber(marketStats.price)}</div>
        </div>
        <div className="rounded-lg border border-border/10 bg-[#1A1A1A] p-4">
          <div className="text-xs font-medium text-muted-foreground">Market Cap</div>
          <div className="mt-1.5 text-xl font-semibold text-foreground">{formatNumber(marketStats.marketCap)}</div>
        </div>
        <div className="rounded-lg border border-border/10 bg-[#1A1A1A] p-4">
          <div className="text-xs font-medium text-muted-foreground">Treasury Balance</div>
          <div className="mt-1.5 text-xl font-semibold text-foreground">{formatNumber(marketStats.treasuryBalance)}</div>
        </div>
        <div className="rounded-lg border border-border/10 bg-[#1A1A1A] p-4">
          <div className="text-xs font-medium text-muted-foreground">Holders</div>
          <div className="mt-1.5 text-xl font-semibold text-foreground">{marketStats.holderCount.toLocaleString()}</div>
        </div>
      </div>

      {/* Description and Social Links */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-border/10 bg-[#1A1A1A]">
            <div className="flex items-center justify-between border-b border-border/10 p-4">
              <h2 className="text-sm font-medium text-foreground">Description</h2>
              {collective.description && collective.description.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="h-8 text-xs hover:bg-white/5"
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show Less <ChevronUp className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="h-3 w-3" />
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="p-4">
              <p className={`text-sm text-muted-foreground ${
                !isDescriptionExpanded && collective.description && collective.description.length > 200
                  ? "line-clamp-4"
                  : ""
              }`}>
                {collective.description}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-border/10 bg-[#1A1A1A]">
            <div className="border-b border-border/10 p-4">
              <h3 className="text-sm font-medium text-foreground">Socials</h3>
            </div>
            <div className="flex gap-2 p-4">
              {collective.website_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 hover:bg-white/5"
                >
                  <a
                    href={collective.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsGlobe className="h-3.5 w-3.5" />
                    <span className="sr-only">Website</span>
                  </a>
                </Button>
              )}
              {collective.x_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 hover:bg-white/5"
                >
                  <a
                    href={collective.x_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsTwitterX className="h-3.5 w-3.5" />
                    <span className="sr-only">X (Twitter)</span>
                  </a>
                </Button>
              )}
              {collective.telegram_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 w-8 hover:bg-white/5"
                >
                  <a
                    href={collective.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BsTelegram className="h-3.5 w-3.5" />
                    <span className="sr-only">Telegram</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Treasury Tokens Table */}
      <div className="rounded-lg border border-border/10 bg-[#1A1A1A]">
        <div className="border-b border-border/10 p-4">
          <h2 className="text-sm font-medium text-foreground">Treasury Holdings</h2>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5">
                <TableHead className="text-xs font-medium text-muted-foreground">Type</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">Amount</TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treasuryTokens.map((token, index) => (
                <TableRow key={index} className="hover:bg-white/5">
                  <TableCell className="text-sm font-medium text-foreground">{token.type}</TableCell>
                  <TableCell className="text-sm text-foreground">{token.name}</TableCell>
                  <TableCell className="text-sm text-foreground">{token.symbol}</TableCell>
                  <TableCell className="text-right text-sm text-foreground">{token.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-foreground">{formatNumber(token.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export { CollectiveOverview };
export default CollectiveOverview;
