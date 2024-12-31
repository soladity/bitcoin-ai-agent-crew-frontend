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

interface LeaderboardTableProps {
  leaderboard: ProfileWithBalance[];
  authenticatedUserEmail?: string;
}

export function LeaderboardTable({ leaderboard, authenticatedUserEmail }: LeaderboardTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Rank</TableHead>
          <TableHead>Participant</TableHead>
          <TableHead>Agent Address</TableHead>
          <TableHead className="text-right">Portfolio Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((profile: ProfileWithBalance) => (
          <TableRow
            key={profile.email}
            className={
              profile.email === authenticatedUserEmail
                ? "bg-primary/10"
                : undefined
            }
          >
            <TableCell>
              <span className="font-medium">{profile.rank}</span>
            </TableCell>
            <TableCell>
              <span className="font-mono">
                {profile.email.split("@")[0].toUpperCase()}
              </span>
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
        ))}
      </TableBody>
    </Table>
  );
}
