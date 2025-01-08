"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";

interface Holder {
  address: string;
  balance: string;
  percentage: number;
  value_usd?: string;
  last_transaction?: string;
}

interface DAOHoldersProps {
  holders: Holder[];
  tokenSymbol: string;
}

function DAOHolders({ holders, tokenSymbol }: DAOHoldersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("balance");

  const filteredHolders = holders.filter((holder) =>
    holder.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHolders = [...filteredHolders].sort((a, b) => {
    switch (sortBy) {
      case "balance":
        return parseFloat(b.balance) - parseFloat(a.balance);
      case "percentage":
        return b.percentage - a.percentage;
      case "value":
        return parseFloat(b.value_usd || "0") - parseFloat(a.value_usd || "0");
      default:
        return 0;
    }
  });

  const totalHolders = holders.length;
  const top10Holdings = holders
    .slice(0, 10)
    .reduce((acc, holder) => acc + holder.percentage, 0)
    .toFixed(2);
  const avgBalance = (
    holders.reduce((acc, holder) => acc + parseFloat(holder.balance), 0) /
    totalHolders
  ).toFixed(2);

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
        <div className="relative z-10 px-6 py-8">
          <div className="mx-auto max-w-screen-xl">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Token Holders
            </h1>
            <p className="text-muted-foreground">
              View and analyze the distribution of token holders
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-xl px-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border bg-background/50 backdrop-blur-sm p-4">
            <div className="text-sm text-muted-foreground">Total Holders</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {totalHolders}
            </div>
          </div>
          <div className="rounded-lg border bg-background/50 backdrop-blur-sm p-4">
            <div className="text-sm text-muted-foreground">Top 10 Holdings</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {top10Holdings}%
            </div>
          </div>
          <div className="rounded-lg border bg-background/50 backdrop-blur-sm p-4">
            <div className="text-sm text-muted-foreground">Average Balance</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {avgBalance} {tokenSymbol}
            </div>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              {holders[0]?.value_usd && (
                <SelectItem value="value">Value (USD)</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Holders Table */}
        <div className="rounded-lg border bg-background/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                {holders[0]?.value_usd && (
                  <TableHead className="text-right">Value (USD)</TableHead>
                )}
                {holders[0]?.last_transaction && (
                  <TableHead>Last Transaction</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHolders.map((holder, index) => (
                <TableRow key={holder.address}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {holder.address}
                    </code>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {parseFloat(holder.balance).toLocaleString()} {tokenSymbol}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {holder.percentage.toFixed(2)}%
                  </TableCell>
                  {holders[0]?.value_usd && (
                    <TableCell className="text-right tabular-nums">
                      ${parseFloat(holder.value_usd || "0").toLocaleString()}
                    </TableCell>
                  )}
                  {holders[0]?.last_transaction && (
                    <TableCell>{holder.last_transaction}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export { DAOHolders };
export default DAOHolders;
