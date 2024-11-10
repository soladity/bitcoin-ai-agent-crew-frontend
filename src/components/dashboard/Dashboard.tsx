"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/utils/supabase/client";
import { CrewManagement } from "@/components/crews/CrewManagement";
import { CloneTradingAnalyzer } from "@/components/crews/CloneTradingAnalyzer";
import DashboardChat from "./DashboardChat";
import { Crew } from "@/types/supabase";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const getChevronIcon = (state: "expanded" | "collapsed") => {
  return state === "expanded" 
    ? <ChevronLeft className="h-6 w-6" /> 
    : <ChevronRight className="h-6 w-6" />;
};
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Dashboard() {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [hasClonedAnalyzer, setHasClonedAnalyzer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);

  const fetchCrews = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("crews")
        .select("id, name, description, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
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

      if (error) throw error;
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

  const handleCrewSelect = useCallback((crew: Crew | null) => {
    setSelectedCrew(crew);
  }, []);

  const handleCloneComplete = useCallback(() => {
    setHasClonedAnalyzer(true);
    fetchCrews();
  }, [fetchCrews]);

  const handleCrewsUpdated = useCallback(
    (updatedCrews: Crew[]) => {
      setCrews(updatedCrews);
      if (updatedCrews.length === 0) {
        setSelectedCrew(null);
      }
      checkClonedAnalyzer();
    },
    [checkClonedAnalyzer]
  );

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar className="w-64 border-r">
        <SidebarHeader className="p-4 border-b">
          <h2 className="text-lg font-semibold">Manage Crews</h2>
        </SidebarHeader>
        <SidebarContent className="p-4">
          {isLoading ? (
            <p className="text-muted-foreground">Loading crews...</p>
          ) : (
            <CrewManagement
              initialCrews={crews}
              onCrewSelect={handleCrewSelect}
              onCrewUpdate={handleCrewsUpdated}
              selectedCrew={selectedCrew}
            />
          )}
          {!isLoading && !hasClonedAnalyzer && (
            <CloneTradingAnalyzer
              onCloneComplete={handleCloneComplete}
              disabled={false}
            />
          )}
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="block">
              {({ state }) => getChevronIcon(state)}
            </SidebarTrigger>
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DashboardChat selectedCrew={selectedCrew} />
        </main>
      </div>
    </div>
  );
}
