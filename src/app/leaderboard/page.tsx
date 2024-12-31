"use client";

import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { useUserData } from "@/hooks/use-user-data";
import { useLeaderboardData } from "@/hooks/use-leaderboard-data";
import { useLeaderboardSearch } from "@/hooks/use-leaderboard-search";
import { Loader } from "@/components/reusables/loader";
import { LeaderboardHeader } from "@/components/leaderboard/leaderboard-header";
import { UserPositionCard } from "@/components/leaderboard/user-position-card";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";

export const runtime = "edge";

export default function LeaderBoard() {
  const {
    data: leaderboard,
    isLoading,
    totalAgentBalance,
    error,
  } = useLeaderboardData();
  const { data: userData } = useUserData();
  const { searchTerm, setSearchTerm, filteredLeaderboard } = useLeaderboardSearch(leaderboard);

  const authenticatedUserProfile = useMemo(() => {
    if (!leaderboard || !userData) return null;
    return leaderboard.find(
      (profile) =>
        profile.email.split("@")[0].toLowerCase() ===
        userData.stxAddress.toLowerCase()
    );
  }, [leaderboard, userData]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mx-auto">
      <LeaderboardHeader
        totalAgentBalance={totalAgentBalance}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <CardContent>
        {authenticatedUserProfile && (
          <UserPositionCard profile={authenticatedUserProfile} />
        )}
        <LeaderboardTable
          leaderboard={filteredLeaderboard}
          authenticatedUserEmail={authenticatedUserProfile?.email}
        />
        <div className="mt-6 text-sm text-muted-foreground text-center">
          Total participants: {filteredLeaderboard.length}
        </div>
      </CardContent>
    </Card>
  );
}
