"use client";

import { useState, useEffect } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  const executionData = [
    { name: "Main Chat", value: data.main_chat_jobs },
    { name: "Crew Chat", value: data.individual_crew_jobs },
  ];

  const addressData = data.top_profile_stacks_addresses.map(
    (address, index) => ({
      name: `A${index + 1}`,
      value: 1,
      fullAddress: address,
    })
  );

  const crewData = data.top_crew_names.map((name, index) => ({
    name: name.length > 12 ? name.slice(0, 12) + "..." : name,
    value: Math.max(5 - index, 1),
  }));

  return (
    <div className="p-4 space-y-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-center">
          Public Stats Dashboard
        </h1>
        <span className="text-md text-muted-foreground">
          Last updated:
          {new Date(data.timestamp).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Crew Executions so far
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_jobs.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Main Chat Executions so far
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.main_chat_jobs.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Individual Crew Jobs so far
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.individual_crew_jobs.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">Execution Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] md:h-[300px] w-[90%]"
              config={{
                main: { label: "Main Chat", color: "hsl(var(--primary))" },
                crew: {
                  label: "Individual Crew",
                  color: "hsl(var(--secondary))",
                },
              }}
            >
              <BarChart data={executionData} barSize={20}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value">
                  {executionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === 0 ? "var(--color-main)" : "var(--color-crew)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg">
              Top Profile Stack Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[200px] md:h-[300px]"
              config={{
                address: { label: "Address", color: "hsl(var(--primary))" },
              }}
            >
              <PieChart>
                <Pie
                  data={addressData}
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  fill="var(--color-address)"
                  dataKey="value"
                  label={({ name }) => name}
                  labelLine={false}
                >
                  {addressData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--${
                        index % 2 ? "primary" : "secondary"
                      }))`}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background text-foreground p-2 border rounded shadow text-xs">
                          <p>{data.fullAddress}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Top Crews</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[200px] md:h-[300px]"
            config={{
              crew: { label: "Crew", color: "hsl(var(--primary))" },
            }}
          >
            <BarChart data={crewData} layout="vertical" barSize={20}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-crew)">
                {crewData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(var(--${index % 2 ? "primary" : "secondary"}))`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
