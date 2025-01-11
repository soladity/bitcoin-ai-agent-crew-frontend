import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { Extension, DAO, Holder, Token } from "@/types/supabase";

interface MarketStats {
  price: number;
  marketCap: number;
  treasuryBalance: number;
  holderCount: number;
}

interface TreasuryToken {
  type: 'FT' | 'NFT';
  name: string;
  symbol: string;
  amount: number;
  value: number;
}

interface TokenBalance {
  balance: string;
  total_sent: string;
  total_received: string;
}

interface HiroBalanceResponse {
  stx: TokenBalance;
  fungible_tokens: {
    [key: string]: TokenBalance;
  };
  non_fungible_tokens: {
    [key: string]: {
      count: number;
      total_sent: number;
      total_received: number;
    };
  };
}

interface HiroHolderResponse {
  total_supply: string;
  limit: number;
  offset: number;
  total: number;
  results: {
    address: string;
    balance: string;
  }[];
}

// Cache for storing fetched data
const daoCache = new Map<string, {
  data: {
    dao: DAO | null;
    daoExtensions: Extension[] | null;
    holders: Holder[];
    tokenSymbol: string;
    token: Token;
    marketStats: MarketStats;
    treasuryTokens: TreasuryToken[];
  };
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function useDAODetails(id: string) {
  const [dao, setDAO] = useState<DAO | null>(null);
  const [daoExtensions, setDAOExtensions] = useState<Extension[] | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [token, setToken] = useState<Token>({
    id: "0",
    dao_id: "0",
    contract_principal: "",
    name: "",
    symbol: "",
    decimals: 0,
    image_url: "",
  });
  const [marketStats, setMarketStats] = useState<MarketStats>({
    price: 0,
    marketCap: 0,
    treasuryBalance: 0,
    holderCount: 0,
  });
  const [treasuryTokens, setTreasuryTokens] = useState<TreasuryToken[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolders = async (contractPrincipal: string, tokenSymbol: string) => {
    try {
      const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
      const response = await fetch(
        `https://api.${network}.hiro.so/extended/v1/tokens/ft/${contractPrincipal}::${tokenSymbol}/holders`
      );
      const data: HiroHolderResponse = await response.json();

      const holdersWithPercentage = data.results.map((holder) => ({
        ...holder,
        percentage: (Number(holder.balance) / Number(data.total_supply)) * 100,
      }));

      setHolders(holdersWithPercentage);
      return {
        totalSupply: Number(data.total_supply),
        holderCount: data.results.length
      };
    } catch (error) {
      console.error("Error fetching holders:", error);
      return { totalSupply: 0, holderCount: 0 };
    }
  };

  const fetchTokenPrice = async (contractPrincipal: string, tokenSymbol: string) => {
    try {
      // For now, return a random price between 0.1 and 10 for testing
      // You'll need to replace this with actual price data from your source
      console.log(`Fetching price for ${contractPrincipal}::${tokenSymbol}`);
      return Math.random() * 9.9 + 0.1;
    } catch (error) {
      console.error("Error fetching token price:", error);
      return 0;
    }
  };

  const fetchTreasuryTokens = async (treasuryAddress: string) => {
    try {
      // Fetch balances
      const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
      const response = await fetch(
        `https://api.${network}.hiro.so/extended/v1/address/${treasuryAddress}/balances`
      );
      const data = (await response.json()) as HiroBalanceResponse;

      const tokens: TreasuryToken[] = [];

      // Add STX balance if any
      if (data.stx && Number(data.stx.balance) > 0) {
        tokens.push({
          type: 'FT',
          name: 'Stacks',
          symbol: 'STX',
          amount: Number(data.stx.balance) / 1_000_000, // Convert from microSTX to STX
          value: 0, // Will need to fetch STX price
        });
      }

      // Add fungible tokens
      if (data.fungible_tokens) {
        for (const [assetIdentifier, tokenData] of Object.entries(data.fungible_tokens)) {
          // Extract contract address and token name from asset identifier
          const [, tokenInfo] = assetIdentifier.split('::');
          tokens.push({
            type: 'FT',
            name: tokenInfo || assetIdentifier,
            symbol: tokenInfo || '',
            amount: Number(tokenData.balance),
            value: 0, // Will need to fetch token price
          });
        }
      }

      // Add non-fungible tokens if any
      if (data.non_fungible_tokens) {
        for (const [assetIdentifier,] of Object.entries(data.non_fungible_tokens)) {
          const [, nftInfo] = assetIdentifier.split('::');
          tokens.push({
            type: 'NFT',
            name: nftInfo || assetIdentifier,
            symbol: nftInfo || '',
            amount: 1,
            value: 0, // Will need to fetch NFT floor price
          });
        }
      }

      return tokens;
    } catch (error) {
      console.error("Error fetching treasury tokens:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // Check cache first
      const cachedData = daoCache.get(id);
      const now = Date.now();

      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        // Use cached data
        setDAO(cachedData.data.dao);
        setDAOExtensions(cachedData.data.daoExtensions);
        setHolders(cachedData.data.holders);
        setTokenSymbol(cachedData.data.tokenSymbol);
        setToken(cachedData.data.token);
        setMarketStats(cachedData.data.marketStats);
        setTreasuryTokens(cachedData.data.treasuryTokens);
        setLoading(false);
        return;
      }

      try {
        // Fetch dao and extensions
        const { data: daoData, error: daoError } = await supabase
          .from("daos")
          .select("*")
          .eq("id", id)
          .single();

        if (daoError) throw daoError;
        setDAO(daoData);

        const { data: extensionsData, error: extensionsError } = await supabase
          .from("extensions")
          .select("*")
          .eq("dao_id", id);

        if (extensionsError) throw extensionsError;
        setDAOExtensions(extensionsData);

        // Fetch token data
        const { data: tokensData, error: tokensError } = await supabase
          .from("tokens")
          .select("*")
          .eq("dao_id", id);

        if (tokensError) throw tokensError;

        if (tokensData && tokensData.length > 0) {
          const currentToken = tokensData[0];
          setToken(currentToken);
          setTokenSymbol(currentToken.symbol);

          // Fetch holders and market data
          const { totalSupply, holderCount } = await fetchHolders(
            currentToken.contract_principal,
            currentToken.symbol
          );

          const price = await fetchTokenPrice(
            currentToken.contract_principal,
            currentToken.symbol
          );

          const marketCap = price * totalSupply;

          // Fetch treasury tokens
          const treasuryAddr = extensionsData.find(
            (extension) => extension.type === "aibtc-ext006-treasury"
          )?.contract_principal;

          if (!treasuryAddr) throw new Error("No treasury address found");

          const treasuryTokensList = await fetchTreasuryTokens(treasuryAddr);
          setTreasuryTokens(treasuryTokensList);

          const treasuryBalance = treasuryTokensList.reduce(
            (sum, token) => sum + token.value,
            0
          );

          const newMarketStats = {
            price,
            marketCap,
            treasuryBalance,
            holderCount,
          };
          setMarketStats(newMarketStats);

          // Cache the fetched data
          daoCache.set(id, {
            data: {
              dao: daoData,
              daoExtensions: extensionsData,
              holders: holders,
              tokenSymbol: currentToken.symbol,
              token: currentToken,
              marketStats: newMarketStats,
              treasuryTokens: treasuryTokensList,
            },
            timestamp: now,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    dao,
    daoExtensions,
    holders,
    tokenSymbol,
    token,
    marketStats,
    treasuryTokens,
    loading,
  };
}
