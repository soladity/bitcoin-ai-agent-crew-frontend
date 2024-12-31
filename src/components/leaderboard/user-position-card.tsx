import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PortfolioValueCell } from "./portfolio-value-cell";
import { ProfileWithBalance } from "@/types/supabase";

interface UserPositionCardProps {
  profile: ProfileWithBalance;
}

export function UserPositionCard({ profile }: UserPositionCardProps) {
  return (
    <Card className="mb-6 bg-primary/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-bold">Your Position</span>
          </div>
          <Badge variant="secondary">
            Rank: {profile.rank}
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Agent Address</TableHead>
              <TableHead className="text-right">Portfolio Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono">
                {profile.email.split("@")[0].toUpperCase()}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {profile.assigned_agent_address || (
                  <Badge variant="outline">No agent assigned</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <PortfolioValueCell
                  value={profile.portfolioValue}
                  isLoading={profile.isLoadingBalance}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
