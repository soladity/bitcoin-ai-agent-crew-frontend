import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "lucide-react";

interface Holder {
  address: string;
  balance: string;
  percentage: number;
}

interface CollectiveHoldersProps {
  holders: Holder[];
  totalSupply: string;
}

export function CollectiveHolders({ holders, totalSupply }: CollectiveHoldersProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Token Holders</h2>
          <p className="text-sm text-muted-foreground">
            Total Supply: {totalSupply ? Number(totalSupply).toLocaleString() : 0}
          </p>
        </div>
        <span className="text-sm text-muted-foreground">
          {holders.length} holders
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holders.map((holder) => (
            <TableRow key={holder.address}>
              <TableCell className="font-mono">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {holder.address}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {Number(holder.balance).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {holder.percentage.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
