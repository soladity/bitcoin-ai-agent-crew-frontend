"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public_stats/`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const result: PublicStats = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };
    void fetchData();
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
  const crewPercentage = Math.round((data.individual_crew_jobs / totalJobs) * 100);
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            {totalJobs.toLocaleString()}
          </h1>
          <p className="text-xl text-gray-400">
            AI Tasks Completed and Counting
          </p>
        </div>

        {/* Impact Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gray-900 border-none">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="text-3xl font-bold">{crewPercentage}%</div>
                <p className="text-gray-400">Tasks Run by Crews</p>
                <p className="text-sm text-gray-500">
                  Teams are building autonomous AI workflows
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-none">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {data.top_crew_names[0]}
                </div>
                <p className="text-gray-400">Most Popular Crew</p>
                <p className="text-sm text-gray-500">
                  Leading the way in AI automation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Users Section */}
        <div className="bg-gray-900 rounded-xl p-8 space-y-6">
          <h2 className="text-xl font-semibold">Active Power Users</h2>
          <div className="space-y-4">
            {data.top_profile_stacks_addresses.map((address, i) => (
              <div 
                key={address}
                className="flex items-center space-x-4 text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {i + 1}
                </div>
                <div className="font-mono text-gray-400">
                  {address.slice(0, 8)}...{address.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
