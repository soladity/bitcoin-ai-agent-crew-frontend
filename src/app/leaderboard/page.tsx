"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Profile {
  email: string;
  stxBalance: number;
}

export default function LeaderBoard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("email");

        if (error) {
          throw error;
        }

        const profilesWithBalance = await Promise.all(
          data.map(async (profile) => {
            try {
              const stacksAddress = profile.email.split("@")[0].toUpperCase(); // Remove @stacks.id and convert to uppercase
              const response = await fetch(
                `https://api.hiro.so/extended/v1/address/${stacksAddress}/balances`
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const balanceData = await response.json();
              const stxBalance = balanceData.stx?.balance
                ? parseInt(balanceData.stx.balance) / 1000000
                : 0;

              return {
                email: profile.email,
                stxBalance: stxBalance,
              };
            } catch (err) {
              console.error(
                `Error fetching balance for ${profile.email}:`,
                err
              );
              return {
                email: profile.email,
                stxBalance: 0,
              };
            }
          })
        );

        // Sort profiles by STX balance in descending order
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
      <div
        className="flex justify-center items-center h-64"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading leaderboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <Link href="/">
        <Button>Go back</Button>
      </Link>
      <ul className="space-y-2">
        {profiles.map((profile, index) => (
          <li
            key={profile.email}
            className="p-3 bg-card text-card-foreground rounded-lg shadow hover:shadow-md transition-shadow flex justify-between items-center"
          >
            <span>
              <span className="font-medium mr-2">{index + 1}.</span>
              {profile.email.split("@")[0]}
            </span>
            <span className="text-sm">
              <span className="font-medium">
                {profile.stxBalance.toFixed(2)}
              </span>{" "}
              STX
            </span>
          </li>
        ))}
      </ul>
      <p className="text-muted-foreground">Total profiles: {profiles.length}</p>
    </div>
  );
}
