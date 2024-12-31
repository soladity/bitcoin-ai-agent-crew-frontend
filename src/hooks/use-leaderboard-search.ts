import { useState, useMemo } from "react";
import { ProfileWithBalance } from "@/types/supabase";

export function useLeaderboardSearch(leaderboard: ProfileWithBalance[] | null) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredLeaderboard = useMemo(() => {
    return (leaderboard ?? []).filter((profile) => {
      const stacksAddress = profile.email.split("@")[0].toLowerCase();
      return stacksAddress.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, leaderboard]);

  return {
    searchTerm,
    setSearchTerm,
    filteredLeaderboard,
  };
}
