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
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-between p-8">
          <div className="flex items-center gap-6">
            {token?.image_url && (
              <Image
                src={token.image_url}
                alt={collective.name}
                width={100}
                height={100}
                className="rounded-lg border-4 border-background"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold">{collective.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{collective.mission}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Token Price</div>
          <div className="mt-2 text-2xl font-bold">{formatNumber(marketStats.price)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="mt-2 text-2xl font-bold">{formatNumber(marketStats.marketCap)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Treasury Balance</div>
          <div className="mt-2 text-2xl font-bold">{formatNumber(marketStats.treasuryBalance)}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Holders</div>
          <div className="mt-2 text-2xl font-bold">{marketStats.holderCount.toLocaleString()}</div>
        </Card>
      </div>

      {/* Description and Social Links */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Description</h2>
              {collective.description && collective.description.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className={`mt-4 text-muted-foreground ${
              !isDescriptionExpanded && collective.description && collective.description.length > 200
                ? "line-clamp-4"
                : ""
            }`}>
              {collective.description}
            </p>
          </Card>
        </div>

        <div>
          {/* Social Links */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Socials</h3>
            <div className="flex gap-4">
              {collective.website_url && (
                <a
                  href={collective.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <BsGlobe className="h-5 w-5" />
                </a>
              )}
              {collective.x_url && (
                <a
                  href={collective.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <BsTwitterX className="h-5 w-5" />
                </a>
              )}
              {collective.telegram_url && (
                <a
                  href={collective.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <BsTelegram className="h-5 w-5" />
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Treasury Tokens Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Treasury Holdings</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treasuryTokens.map((token, index) => (
              <TableRow key={index}>
                <TableCell>{token.type}</TableCell>
                <TableCell>{token.name}</TableCell>
                <TableCell>{token.symbol}</TableCell>
                <TableCell className="text-right">{token.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatNumber(token.value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export { CollectiveOverview };
export default CollectiveOverview;
