"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
    holders.reduce((acc, holder) => acc + parseFloat(holder.balance), 0) / totalHolders
  ).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Holders</div>
          <div className="mt-2 text-2xl font-bold">{totalHolders}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Top 10 Holdings</div>
          <div className="mt-2 text-2xl font-bold">{top10Holdings}%</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Average Balance</div>
          <div className="mt-2 text-2xl font-bold">
            {avgBalance} {tokenSymbol}
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
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

      <Card>
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
                <TableCell className="font-mono">{holder.address}</TableCell>
                <TableCell className="text-right">
                  {parseFloat(holder.balance).toLocaleString()} {tokenSymbol}
                </TableCell>
                <TableCell className="text-right">
                  {holder.percentage.toFixed(2)}%
                </TableCell>
                {holders[0]?.value_usd && (
                  <TableCell className="text-right">
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
      </Card>
    </div>
  );
}

export { DAOHolders };
export default DAOHolders;
