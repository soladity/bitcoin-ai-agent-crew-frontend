"use client";

import React, { useState, useMemo } from "react";
import { Loader2, Search, Trophy, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLeaderboardData } from "@/hooks/useLeaderBoardData";
import { useUserData } from "@/hooks/useUserData";

export default function LeaderBoard() {
  const { data: profiles, isLoading, error } = useLeaderboardData();
  const { data: userData } = useUserData();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const sortedProfiles = useMemo(() => {
    if (!profiles) return [];
    return [...profiles].sort((a, b) => {
      const balanceA = a.agentBalance || 0;
      const balanceB = b.agentBalance || 0;
      return balanceB - balanceA;
    });
  }, [profiles]);

  const filteredProfiles = useMemo(() => {
    return sortedProfiles.filter((profile) => {
      const stacksAddress = profile.email.split("@")[0].toLowerCase();
      return stacksAddress.includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, sortedProfiles]);

  const authenticatedUserProfile = useMemo(() => {
    if (!sortedProfiles || !userData) return null;
    return sortedProfiles.find(
      (profile) =>
        profile.email.split("@")[0].toLowerCase() ===
        userData.stxAddress.toLowerCase()
    );
  }, [sortedProfiles, userData]);

  const authenticatedUserRank = useMemo(() => {
    if (!authenticatedUserProfile) return null;
    return (
      sortedProfiles.findIndex(
        (profile) => profile.email === authenticatedUserProfile.email
      ) + 1
    );
  }, [sortedProfiles, authenticatedUserProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full mx-auto my-8">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <CardTitle className="text-2xl font-bold">
          Participant Leaderboard
        </CardTitle>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search Participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {authenticatedUserProfile && (
          <Card className="mb-6 bg-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="font-bold">Your Position</span>
                </div>
                <Badge variant="secondary">Rank: {authenticatedUserRank}</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Participant</TableHead>
                    <TableHead>Agent Address</TableHead>
                    <TableHead className="text-right">Agent Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">
                      {authenticatedUserProfile.email
                        .split("@")[0]
                        .toUpperCase()}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {authenticatedUserProfile.assigned_agent_address || (
                        <Badge variant="outline">No agent assigned</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {authenticatedUserProfile.agentBalance !== undefined
                        ? `${authenticatedUserProfile.agentBalance.toFixed(
                            2
                          )} STX`
                        : "-"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Agent Address</TableHead>
              <TableHead className="text-right">Agent Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile, index) => (
              <TableRow
                key={profile.email}
                className={
                  profile.email === authenticatedUserProfile?.email
                    ? "bg-primary/10"
                    : undefined
                }
              >
                <TableCell className="font-medium">
                  {index < 3 ? (
                    <Trophy
                      className={`h-5 w-5 ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-400"
                          : "text-amber-600"
                      }`}
                    />
                  ) : (
                    `${index + 1}`
                  )}
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
                <TableCell className="text-right font-bold">
                  {profile.agentBalance !== undefined
                    ? `${profile.agentBalance.toFixed(2)} STX`
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-6 text-sm text-muted-foreground text-center">
          Total participants: {filteredProfiles.length}
        </div>
      </CardContent>
    </Card>
  );
}
