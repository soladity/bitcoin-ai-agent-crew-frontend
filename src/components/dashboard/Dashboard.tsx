"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { CrewManagement } from "@/components/crews/CrewManagement";
import { CloneTradingAnalyzer } from "@/components/crews/CloneTradingAnalyzer";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DashboardChat from "./DashboardChat";
import { Crew } from "@/types/supabase";
import { AlertCircle, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [hasClonedAnalyzer, setHasClonedAnalyzer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchCrews = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkClonedAnalyzer = useCallback(async () => {
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
        .eq("name", "Trading Analyzer");

      if (error) {
        throw error;
      }

      setHasClonedAnalyzer(data && data.length > 0);
    } catch (err) {
      console.error("Error checking for cloned analyzer:", err);
      setError("Failed to check cloned analyzer status");
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      await Promise.all([fetchCrews(), checkClonedAnalyzer()]);
    };

    initializeDashboard();
  }, [fetchCrews, checkClonedAnalyzer]);

  const handleCloneComplete = useCallback(() => {
    setHasClonedAnalyzer(true);
    fetchCrews();
  }, [fetchCrews]);

  const handleCrewsUpdated = useCallback(
    (updatedCrews: Crew[]) => {
      setCrews(updatedCrews);
      checkClonedAnalyzer();
    },
    [checkClonedAnalyzer]
  );

  const toggleSheet = useCallback(() => {
    setIsSheetOpen((prev) => !prev);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button onClick={toggleSheet}>
            Click to manage Crews <Settings className="mb-1" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Manage Crews</SheetTitle>
            <SheetDescription>
              Create, edit, or delete your crews here.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <p className="text-muted-foreground">Loading crews...</p>
          ) : (
            <CrewManagement
              initialCrews={crews}
              onCrewUpdate={handleCrewsUpdated}
            />
          )}
        </SheetContent>
      </Sheet>

      {!isLoading && !hasClonedAnalyzer && (
        <CloneTradingAnalyzer
          onCloneComplete={handleCloneComplete}
          disabled={false}
        />
      )}
      <Link href="/public-crews" className="ml-3">
        <Button variant="secondary">View Public Crews</Button>
      </Link>
      <DashboardChat />
    </div>
  );
}
