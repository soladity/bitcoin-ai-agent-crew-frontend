"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Loader } from "@/components/reusables/Loader";
import { supabase } from "@/utils/supabase/client";

interface CrewMetrics {
  total_crews: number;
  crews_by_date: {
    [date: string]: string[];
  };
}

interface CrewData {
  created_at: string;
  name: string;
}

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<CrewMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Query crews directly from Supabase
        const { data: crews, error: crewsError } = await supabase
          .from('crews')
          .select('created_at,name')
          .order('created_at', { ascending: true });

        if (crewsError) {
          throw crewsError;
        }

        // Process crews data
        const crews_by_date: { [key: string]: string[] } = {};
        crews?.forEach((crew: CrewData) => {
          const date = crew.created_at.split('T')[0];  // Get just the date part
          if (!crews_by_date[date]) {
            crews_by_date[date] = [];
          }
          crews_by_date[date].push(crew.name);
        });

        setMetrics({
          total_crews: crews?.length || 0,
          crews_by_date
        });
      } catch (error: unknown) {
        console.error('Error fetching metrics:', error);
        setError("Failed to fetch metrics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex justify-center items-center h-screen">
        No data available
      </div>
    );
  }

  const chartData = Object.entries(metrics.crews_by_date)
    .map(([date, crews]) => ({
      date,
      count: crews.length,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="container mx-auto p-4">
      <p className="text-4xl font-bold">
        Total Crews so far: {metrics.total_crews}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Crews Created by Date</CardTitle>
          <CardDescription>
            Number of crews created on each date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Number of Crews",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  name="Number of Crews"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
