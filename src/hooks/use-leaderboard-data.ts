import { useQuery, useQueries } from "@tanstack/react-query";
import { supabase } from "@/utils/supabase/client";
import { useMemo } from "react";
import { BalanceResponse, TokenPrice, Profile, ProfileWithBalance } from "@/types/supabase";

function normalizeContractId(contractId: string): string {
  return contractId.split("::")[0];
}

// Fetch balance for a given address
async function fetchAgentBalance(address: string): Promise<BalanceResponse> {
  try {
    const balanceResponse = await fetch(`/fetch?address=${address}`);
    if (!balanceResponse.ok) throw new Error(`Failed to fetch balance data: ${balanceResponse.statusText}`);
    return await balanceResponse.json();
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    throw error;
  }
}

// Fetch token prices
async function fetchTokenPrices(): Promise<TokenPrice[]> {
  try {
    const response = await fetch('https://cache.aibtc.dev/stx-city/tokens/tradable-full-details-tokens');
    if (!response.ok) throw new Error(`Failed to fetch token prices: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching token prices:", error);
    throw error;
  }
}

// Calculate the total portfolio value
function calculatePortfolioValue(balances: BalanceResponse, tokenPrices: TokenPrice[]): number {
  let totalValue = 0;

  // STX token calculation
  const stxBalance = parseInt(balances.stx.balance) / 1_000_000;
  const stxPrice = tokenPrices.find((token) => token.symbol === 'STX')?.metrics.price_usd || 0;
  totalValue += stxBalance * stxPrice;

  // Calculate value for each fungible token
  for (const [contractId, tokenData] of Object.entries(balances.fungible_tokens)) {
    const normalizedContractId = normalizeContractId(contractId);
    const balance = parseInt(tokenData.balance);

    const tokenInfo = tokenPrices.find(
      (token) => token.contract_id && normalizeContractId(token.contract_id) === normalizedContractId
    );

    if (tokenInfo && tokenInfo.metrics.price_usd) {
      // Adjust balance based on token decimals
      const adjustedBalance = balance / Math.pow(10, tokenInfo.decimals);
      const tokenValue = adjustedBalance * tokenInfo.metrics.price_usd;
      totalValue += tokenValue;
    } else {
      console.warn(`No price found for token ${contractId}`);
    }
  }

  return totalValue;
}

async function fetchLeaderboardData(): Promise<Profile[]> {
  try {
    const [participantResponse, adminResponse] = await Promise.all([
      supabase.from("profiles").select("email, assigned_agent_address").eq("role", "Participant"),
      supabase.from("profiles").select("email, assigned_agent_address").eq("role", "Admin")
    ]);

    if (participantResponse.error) throw participantResponse.error;
    if (adminResponse.error) throw adminResponse.error;

    return [
      ...(participantResponse.data ?? []),
      ...(adminResponse.data ?? [])
    ].map((profile) => ({
      email: profile.email,
      assigned_agent_address: profile.assigned_agent_address?.toUpperCase() ?? null,
    }));
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    throw error;
  }
}

export function useLeaderboardData() {
  const tokenPricesQuery = useQuery<TokenPrice[], Error>({
    queryKey: ["tokenPrices"],
    queryFn: fetchTokenPrices,
    staleTime: 300000,
  });

  const profilesQuery = useQuery<Profile[], Error>({
    queryKey: ["profiles"],
    queryFn: fetchLeaderboardData,
    staleTime: 30000,
  });

  const balanceQueries = useQueries({
    queries: (profilesQuery.data ?? []).map((profile) => ({
      queryKey: ["balance", profile.assigned_agent_address],
      queryFn: async () => {
        if (!profile.assigned_agent_address) return { portfolioValue: 0 };

        const balances = await fetchAgentBalance(profile.assigned_agent_address);
        const portfolioValue = calculatePortfolioValue(balances, tokenPricesQuery.data || []);
        return { portfolioValue };
      },
      enabled: !!profile.assigned_agent_address && tokenPricesQuery.isSuccess,
      staleTime: 30000,
      retry: 2,
    })),
  });

  const combinedData: ProfileWithBalance[] = useMemo(() => {
    if (!profilesQuery.data) return [];

    const profiles = profilesQuery.data.map((profile, index) => ({
      ...profile,
      portfolioValue: balanceQueries[index]?.data?.portfolioValue ?? 0,
      isLoadingBalance: balanceQueries[index]?.isLoading ?? false,
      rank: 0,
    }));

    const sortedProfiles = [...profiles].sort((a, b) => b.portfolioValue - a.portfolioValue);

    let currentRank = 0;
    let currentValue = Infinity;
    let increment = 0;

    return sortedProfiles.map((profile) => {
      if (profile.portfolioValue < currentValue) {
        currentRank += 1 + increment;
        increment = 0;
        currentValue = profile.portfolioValue;
      } else {
        increment++;
      }

      return {
        ...profile,
        rank: currentRank,
      };
    });
  }, [profilesQuery.data, balanceQueries]);

  const totalAgentBalance = useMemo(() => {
    const total = combinedData.reduce((sum, profile) => sum + profile.portfolioValue, 0);
    console.log(`Total Agent Balance: $${total.toFixed(2)}`);
    return total;
  }, [combinedData]);

  return {
    data: combinedData,
    totalAgentBalance,
    isLoading: profilesQuery.isLoading || tokenPricesQuery.isLoading,
    error: profilesQuery.error || tokenPricesQuery.error,
  };
}
