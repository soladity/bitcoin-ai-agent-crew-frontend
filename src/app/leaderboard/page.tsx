"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader2, ArrowLeft, Trophy } from "lucide-react";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Profile {
  email: string;
  stxBalance: number;
  role: string;
  assigned_agent_address: string | null;
  agentBalance?: number;
}

export default function LeaderBoard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("email, role, assigned_agent_address")
          .eq("role", "Participant");

        if (error) throw error;

        const profilesWithBalance = await Promise.all(
          data.map(async (profile) => {
            try {
              const stacksAddress = profile.assigned_agent_address
                ? profile.assigned_agent_address.toUpperCase()
                : null;
              console.log(stacksAddress);

              let stxBalance = 0;
              let agentBalance = undefined;

              if (stacksAddress) {
                const participantResponse = await fetch(
                  `https://api.hiro.so/extended/v1/address/${stacksAddress}/balances`
                );

                if (!participantResponse.ok) {
                  throw new Error(
                    `HTTP error! status: ${participantResponse.status}`
                  );
                }

                const participantBalanceData = await participantResponse.json();
                stxBalance = participantBalanceData.stx?.balance
                  ? parseInt(participantBalanceData.stx.balance) / 1000000
                  : 0;

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
                stxBalance: stxBalance,
                role: profile.role,
                assigned_agent_address: stacksAddress,
                agentBalance: agentBalance,
              };
            } catch (err) {
              console.error(
                `Error fetching balance for ${profile.email}:`,
                err
              );
              return {
                email: profile.email,
                stxBalance: 0,
                role: profile.role,
                assigned_agent_address: profile.assigned_agent_address
                  ? profile.assigned_agent_address.toUpperCase()
                  : null,
                agentBalance: undefined,
              };
            }
          })
        );

        const sortedProfiles = profilesWithBalance.sort(
          (a, b) => b.stxBalance - a.stxBalance
        );
        setProfiles(sortedProfiles);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          Participant Leaderboard
        </CardTitle>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go back
          </Button>
        </Link>
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
            {profiles.map((profile, index) => (
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
          Total participants: {profiles.length}
        </div>
      </CardContent>
    </Card>
  );
}
