"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicStats {
  timestamp: string;
  total_jobs: number;
  main_chat_jobs: number;
  individual_crew_jobs: number;
  top_profile_stacks_addresses: string[];
  top_crew_names: string[];
}

export default function PublicStatsDashboard() {
  const [data, setData] = useState<PublicStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://cache.aibtc.dev/supabase/stats');
        if (!response.ok) throw new Error("Failed to fetch stats data");
        const result = await response.json();
        setData({
          timestamp: result.timestamp,
          total_jobs: result.total_jobs,
          main_chat_jobs: result.main_chat_jobs,
          individual_crew_jobs: result.individual_crew_jobs,
          top_profile_stacks_addresses: result.top_profile_stacks_addresses,
          top_crew_names: result.top_crew_names,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    void fetchData();

    // Fetch data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="p-4 space-y-4 md:p-8 lg:p-12">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const totalJobs = data.total_jobs;
  
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              {totalJobs.toLocaleString()}
            </h1>
            <p className="text-xl text-gray-400 mt-4">
              Total Crews Executed
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Chat Tasks: {data.main_chat_jobs.toLocaleString()}</span>
              <span>Crew Tasks: {data.individual_crew_jobs.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0533D1] to-[#FF4F03]"
                style={{ 
                  width: `${(data.individual_crew_jobs / totalJobs) * 100}%`,
                  transition: 'width 1s ease-in-out'
                }}
              />
            </div>
            <div className="text-sm text-gray-500 text-center">
              Distribution of AI Tasks Between Chat and Crews
            </div>
          </div>
        </div>

        {/* Active Users Section
        <div className="bg-gray-900 rounded-xl p-8 space-y-6">
          <h2 className="text-xl font-semibold">Active Power Users</h2>
          <div className="space-y-4">
            {data.top_profile_stacks_addresses.map((address, i) => (
              <div 
                key={address}
                className="flex items-center space-x-4 text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0533D1] to-[#FF4F03] flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="font-mono text-gray-400">
                  {address.slice(0, 8)}...{address.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div> */}

        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
