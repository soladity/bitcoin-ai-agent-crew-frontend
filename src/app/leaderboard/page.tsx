"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader2, Search, Trophy } from "lucide-react";
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

interface Profile {
  email: string;
  assigned_agent_address: string | null;
  agentBalance?: number;
}

export default function LeaderBoard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    setFilteredProfiles(
      profiles.filter((profile) => {
        const stacksAddress = profile.email.split("@")[0].toLowerCase();
        return stacksAddress.includes(searchTerm.toLowerCase());
      })
    );
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, assigned_agent_address")
        .eq("role", "Participant");

      if (error) throw error;

      const profilesWithBalance = await Promise.all(
        data.map(async (profile) => {
          try {
            const stacksAddress = profile.assigned_agent_address
              ? profile.assigned_agent_address.toUpperCase()
              : null;

            let agentBalance = undefined;

            if (stacksAddress) {
              const agentResponse = await fetch(
                `https://api.hiro.so/extended/v1/address/${stacksAddress}/balances`
              );

              if (agentResponse.ok) {
                const agentBalanceData = await agentResponse.json();
                agentBalance = agentBalanceData.stx?.balance
                  ? parseInt(agentBalanceData.stx.balance) / 1000000
                  : 0;
              }
            }
            return {
              email: profile.email,
              assigned_agent_address: stacksAddress,
              agentBalance: agentBalance,
            };
          } catch (err) {
            console.error(`Error fetching balance for ${profile.email}:`, err);
            return {
              email: profile.email,
              assigned_agent_address: profile.assigned_agent_address
                ? profile.assigned_agent_address.toUpperCase()
                : null,
              agentBalance: undefined,
            };
          }
        })
      );

      const sortedProfiles = profilesWithBalance.sort(
        (a, b) => (b.agentBalance || 0) - (a.agentBalance || 0)
      );
      setProfiles(sortedProfiles);
      setFilteredProfiles(sortedProfiles);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
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
              <TableRow key={profile.email}>
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
