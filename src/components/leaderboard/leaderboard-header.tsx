import { Search } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LeaderboardHeaderProps {
  totalAgentBalance: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function LeaderboardHeader({
  totalAgentBalance,
  searchTerm,
  onSearchChange,
}: LeaderboardHeaderProps) {
  return (
    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <CardTitle className="text-2xl font-bold">
        Participant Leaderboard
      </CardTitle>
      <div className="text-sm text-muted-foreground mt-2">
        Total Agent Balance: ${totalAgentBalance.toFixed(2)}
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search Participants..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </CardHeader>
  );
}
