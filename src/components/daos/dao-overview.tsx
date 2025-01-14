"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BsGlobe, BsTwitterX, BsTelegram } from "react-icons/bs";
import { DAO, Token } from "@/types/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DAOOverviewProps {
  dao: DAO;
  token: Token;
  treasuryTokens?: {
    type: "FT" | "NFT";
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

function DAOOverview({
  dao,
  token,
  treasuryTokens = [],
  marketStats = {
    price: 0,
    marketCap: 0,
    treasuryBalance: 0,
    holderCount: 0,
  },
}: DAOOverviewProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="relative">
      {/* Hero Section with Gradient Overlay */}
      <div className="relative mb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
        <div className="relative z-10 px-6 py-12">
          <div className="mx-auto max-w-screen-xl">
            <div className="flex items-start gap-8">
              {/* Token Image */}
              {token?.image_url && (
                <div className="relative h-24 w-24 shrink-0">
                  <Image
                    src={token.image_url}
                    alt={dao.name}
                    fill
                    className="rounded-2xl object-cover ring-1 ring-border/10"
                  />
                </div>
              )}
              {/* DAO Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {dao.name}
                  </h1>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {dao.mission}
                  </p>
                </div>
                {/* Social Links */}
                <div className="flex gap-3">
                  {dao.website_url && (
                    <a
                      href={dao.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BsGlobe className="h-5 w-5" />
                    </a>
                  )}
                  {dao.x_url && (
                    <a
                      href={dao.x_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BsTwitterX className="h-5 w-5" />
                    </a>
                  )}
                  {dao.telegram_url && (
                    <a
                      href={dao.telegram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <BsTelegram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-xl px-6 space-y-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <Metric label="Token Price" value={formatNumber(marketStats.price)} />
          <Metric
            label="Market Cap"
            value={formatNumber(marketStats.marketCap)}
          />
          <Metric
            label="Treasury"
            value={formatNumber(marketStats.treasuryBalance)}
          />
          <Metric
            label="Holders"
            value={marketStats.holderCount.toLocaleString()}
          />
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">About</h2>
            {dao.description && dao.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs"
              >
                {isDescriptionExpanded ? (
                  <>
                    Show Less <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            )}
          </div>
          <p
            className={`text-muted-foreground leading-relaxed ${
              !isDescriptionExpanded &&
              dao.description &&
              dao.description.length > 200
                ? "line-clamp-4"
                : ""
            }`}
          >
            {dao.description}
          </p>
        </div>

        {/* Treasury Section */}
        {treasuryTokens.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Treasury Holdings</h2>
            <div className="rounded-lg border bg-background/50 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treasuryTokens.map((token, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {token.type}
                      </TableCell>
                      <TableCell>{token.name}</TableCell>
                      <TableCell>{token.symbol}</TableCell>
                      <TableCell className="text-right">
                        {token.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(token.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric Component
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export { DAOOverview };
export default DAOOverview;
