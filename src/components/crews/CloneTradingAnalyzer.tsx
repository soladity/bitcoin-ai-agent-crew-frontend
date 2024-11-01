"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { getToolsByCategory } from "@/lib/tools";
import { CloneAgent, CloneTask } from "@/types/supabase";

const DEFAULT_AGENTS: CloneAgent[] = [
  {
    name: "Research agent for ALEX",
    role: "Market Researcher",
    goal: "Analyze and provide insights on market trends using ALEX data",
    backstory:
      "Specialized in processing and analyzing ALEX market data to identify trading opportunities and market patterns",
    agent_tools: [
      ...getToolsByCategory("alex").map((t) => t.id),
      ...getToolsByCategory("web_search").map((t) => t.id),
    ],
  },
  {
    name: "Research agent for bitflow",
    role: "Bitflow Analyst",
    goal: "Monitor and analyze Bitflow trading signals and market data",
    backstory:
      "Expert in interpreting Bitflow signals and correlating them with market movements",
    agent_tools: [
      ...getToolsByCategory("bitflow").map((t) => t.id),
      ...getToolsByCategory("web_search").map((t) => t.id),
    ],
  },
  {
    name: "Research agent for lunarcrush",
    role: "Social Sentiment Analyst",
    goal: "Track and analyze social sentiment data from LunarCrush",
    backstory:
      "Specialized in social media sentiment analysis and its correlation with crypto markets",
    agent_tools: [...getToolsByCategory("lunarcrush").map((t) => t.id)],
  },
  {
    name: "Trade executor for bitflow",
    role: "Trade Executor",
    goal: "Execute trades based on analyzed signals and market conditions",
    backstory:
      "Experienced in implementing trading strategies and managing trade execution",
    agent_tools: [...getToolsByCategory("bitflow").map((t) => t.id)],
  },
];

const createTaskForAgent = (agent: CloneAgent): CloneTask => {
  const taskMap: { [key: string]: CloneTask } = {
    "Research agent for ALEX": {
      description:
        "Analyze available data from ALEX and provide insights on market trends related to the user's input.",
      expected_output:
        "Report on market trends, potential entry/exit points, and risk analysis.",
    },
    "Research agent for bitflow": {
      description:
        "Analyze available tokens on Bitflow and provide insights on potential trading opportunities related to the user's input.",
      expected_output:
        "Report on signal strength, trade recommendations, and risk assessment.",
    },
    "Research agent for lunarcrush": {
      description:
        "Track social sentiment metrics and their correlation with market movements related to the user's input.",
      expected_output:
        "Real-time updates on social sentiment shifts and their market implications.",
    },
    "Trade executor for bitflow": {
      description:
        "Execute trades if requested based on confirmed signals and risk parameters.",
      expected_output:
        "Trade execution reports, position management updates, and performance metrics. Always include the txid returned after making a transaction.",
    },
  };

  return (
    taskMap[agent.name] || {
      description: "Default task description",
      expected_output: "Default expected output",
    }
  );
};

interface CloneTradingAnalyzerProps {
  onCloneComplete: () => void;
}

export function CloneTradingAnalyzer({
  onCloneComplete,
}: CloneTradingAnalyzerProps) {
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCloned, setHasCloned] = useState(false);

  useEffect(() => {
    checkIfAlreadyCloned();
  }, []);

  const checkIfAlreadyCloned = async () => {
    const { data: profile } = await supabase.auth.getUser();
    if (!profile.user) return;

    const { data, error } = await supabase
      .from("crews")
      .select("id")
      .eq("profile_id", profile.user.id)
      .eq("name", "Trading Analyzer")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking for existing TradingAnalyzer:", error);
      return;
    }

    setHasCloned(!!data);
  };

  const createTradingAnalyzer = async () => {
    if (hasCloned) {
      setError("Trading Analyzer has already been cloned.");
      return;
    }

    setIsCloning(true);
    setError(null);

    try {
      const { data: profile } = await supabase.auth.getUser();
      if (!profile.user) {
        throw new Error("No authenticated user found");
      }

      // Create crew
      const { data: crew, error: crewError } = await supabase
        .from("crews")
        .insert({
          name: "Trading Analyzer",
          description:
            "A pre-configured crew with agents and tasks for trading analysis and execution.",
          profile_id: profile.user.id,
        })
        .select()
        .single();

      if (crewError || !crew) {
        throw new Error("Failed to create crew");
      }

      // Create agents and their tasks
      for (const agent of DEFAULT_AGENTS) {
        const { data: createdAgent, error: agentError } = await supabase
          .from("agents")
          .insert({
            name: agent.name,
            role: agent.role,
            goal: agent.goal,
            backstory: agent.backstory,
            agent_tools: agent.agent_tools,
            crew_id: crew.id,
            profile_id: profile.user.id,
          })
          .select()
          .single();

        if (agentError || !createdAgent) {
          console.error("Error creating agent:", agentError);
          continue;
        }

        // Create task for agent
        const task = createTaskForAgent(agent);
        const { error: taskError } = await supabase.from("tasks").insert({
          description: task.description,
          expected_output: task.expected_output,
          agent_id: createdAgent.id,
          crew_id: crew.id,
          profile_id: profile.user.id,
        });

        if (taskError) {
          console.error("Error creating task:", taskError);
        }
      }

      setHasCloned(true);
      onCloneComplete();
      toast({
        title: "Success",
        description:
          "You've successfully cloned the Trading Analyzer. You can find it in your crews list.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={createTradingAnalyzer}
        disabled={isCloning || hasCloned}
        variant="outline"
        className="w-full"
      >
        {isCloning ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>Cloning Trading Analyzer...</span>
          </div>
        ) : hasCloned ? (
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Trading Analyzer Cloned</span>
          </div>
        ) : (
          "Clone Trading Analyzer"
        )}
      </Button>
    </div>
  );
}
