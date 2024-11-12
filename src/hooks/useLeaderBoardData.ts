import { useQuery, useQueries } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";

interface Profile {
  email: string;
  assigned_agent_address: string | null;
}

interface ProfileWithBalance extends Profile {
  balance: number | null;
  rank: number;
  isLoadingBalance: boolean;
}

async function fetchLeaderboardData(): Promise<Profile[]> {
  try {
    const [participantResponse, adminResponse] = await Promise.all([
      supabase
        .from("profiles")
        .select("email, assigned_agent_address")
        .eq("role", "Participant"),
      supabase
        .from("profiles")
        .select("email, assigned_agent_address")
        .eq("role", "Admin")
    ]);

    if (participantResponse.error) throw participantResponse.error;
    if (adminResponse.error) throw adminResponse.error;

    const combinedData: Profile[] = [
      ...(participantResponse.data ?? []),
      ...(adminResponse.data ?? [])
    ].map((profile) => ({
      email: profile.email,
      assigned_agent_address: profile.assigned_agent_address?.toUpperCase() ?? null,
    }));

    return combinedData;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error;
  }
}

async function fetchAgentBalance(address: string): Promise<number | null> {
  try {
    const response = await fetch(`/fetch?address=${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }
    const balanceData = await response.json();
    return balanceData.stx?.balance 
      ? parseInt(balanceData.stx.balance) / 1000000 
      : 0;
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    return null;
  }
}

export function useLeaderboardData() {
  // Fetch profiles
  const { 
    data: profiles, 
    error: profilesError,
    isLoading: isLoadingProfiles,
    ...rest 
  } = useQuery<Profile[], Error>({
    queryKey: ["leaderboardData"],
    queryFn: fetchLeaderboardData,
    refetchOnWindowFocus: false,
  });

  // Fetch balances for each profile with an assigned agent
  const balanceQueries = useQueries({
    queries: (profiles ?? []).map((profile) => ({
      queryKey: ["agentBalance", profile.assigned_agent_address],
      queryFn: () => 
        profile.assigned_agent_address 
          ? fetchAgentBalance(profile.assigned_agent_address)
          : Promise.resolve(null),
      enabled: !!profile.assigned_agent_address,
      staleTime: 30000,
      retry: 2,
    })),
  });

  // Combine profiles with their balances and loading states
  const leaderboardWithBalances: ProfileWithBalance[] = (profiles ?? []).map((profile, index) => ({
    ...profile,
    balance: balanceQueries[index].data ?? null,
    isLoadingBalance: balanceQueries[index].isLoading && !!profile.assigned_agent_address,
    rank: 0, // Initial rank, will be updated in sorting
  }));

  // Sort profiles by balance (null balances at the end)
  const sortedLeaderboard = [...leaderboardWithBalances].sort((a, b) => {
    // If both balances are null, maintain original order
    if (a.balance === null && b.balance === null) return 0;
    // Push null balances to the end
    if (a.balance === null) return 1;
    if (b.balance === null) return -1;
    // Sort by balance in descending order
    return b.balance - a.balance;
  });

  // Assign ranks (tied balances get the same rank)
  const rankedLeaderboard = sortedLeaderboard.map((profile, index, array) => {
    if (index === 0) {
      return { ...profile, rank: 1 };
    }

    const prevProfile = array[index - 1];
    // If current balance equals previous balance, assign same rank
    // Otherwise, assign current position + 1 as rank
    const rank = profile.balance === prevProfile.balance 
      ? prevProfile.rank 
      : index + 1;

    return { ...profile, rank };
  });

  return {
    data: rankedLeaderboard,
    error: profilesError,
    isLoading: isLoadingProfiles,
    isLoadingBalances: balanceQueries.some((query) => query.isLoading),
    ...rest,
  };
}