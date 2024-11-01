"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { CrewManagement } from "@/components/crews/CrewManagement";
import { CloneTradingAnalyzer } from "@/components/crews/CloneTradingAnalyzer";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import DashboardChat from "./DashboardChat";
import { Crew } from "@/types/supabase";

export default function Component() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [hasClonedAnalyzer, setHasClonedAnalyzer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCrews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("crews")
        .select("id, name, description, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCrews(data || []);
    } catch (err) {
      console.error("Error fetching crews:", err);
      setError("Failed to fetch crews");
    }
  }, []);

  const checkClonedAnalyzer = useCallback(async () => {
    if (hasClonedAnalyzer) return;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      const { data, error } = await supabase
        .from("crews")
        .select("*")
        .eq("profile_id", user.id)
        .eq("name", "TradingAnalyzer");

      if (error) {
        throw error;
      }

      setHasClonedAnalyzer(data && data.length > 0);
    } catch (err) {
      console.error("Error checking for cloned analyzer:", err);
      setError("Failed to check cloned analyzer status");
    }
  }, [hasClonedAnalyzer]);

  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([fetchCrews(), checkClonedAnalyzer()]);
    };

    initializeDashboard();
  }, [fetchCrews, checkClonedAnalyzer]);

  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  const handleCrewSelect = useCallback((crew: Crew) => {
    setSelectedCrew(crew);
  }, []);

  const handleCloneComplete = useCallback(() => {
    setHasClonedAnalyzer(true);
    fetchCrews();
  }, [fetchCrews]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md mb-4">
          {error}
        </div>
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Chat with your Crews</CardTitle>
        </CardHeader>
        <CardContent>
          <DashboardChat selectedCrew={selectedCrew} />
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardContent className="mt-4">
          {crews.length > 0 ? (
            <CrewManagement
              crews={crews}
              onCrewSelect={handleCrewSelect}
              onCrewUpdate={fetchCrews}
            />
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t created any crews yet.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <CloneTradingAnalyzer onCloneComplete={handleCloneComplete} />
        </CardFooter>
      </Card>
    </div>
  );
}
