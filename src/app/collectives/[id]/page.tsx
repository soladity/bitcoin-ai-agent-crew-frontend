"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import CollectiveOverview from "@/components/collectives/CollectiveOverview";
import CollectiveHolders from "@/components/collectives/CollectiveHolders";
import CollectiveCapabilities from "@/components/collectives/CollectiveCapabilities";
import { Capability, Collective, Holder, Token } from "@/types/supabase";

export const runtime = "edge";

export default function CollectivePage() {
  const params = useParams();
  const id = params.id as string;
  const [collective, setCollective] = useState<Collective | null>(null);
  const [collectiveCapabilities, setCollectiveCapabilities] = useState<Capability[] | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [token, setToken] = useState<Token>({
    id: "0",
    collective_id: "0",
    contract_principal: "",
    name: "",
    symbol: "",
    decimals: 0,
    image_url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch collective
        const { data: collectiveData, error: collectiveError } = await supabase
          .from("collectives")
          .select("*")
          .eq("id", id)
          .single();

        if (collectiveError) {
          console.error("Error fetching collective:", collectiveError);
          return;
        }
        
        setCollective(collectiveData);

        // Fetch capabilities
        const { data: capabilitiesData, error: capabilitiesError } = await supabase
          .from("capabilities")
          .select("*")
          .eq("collective_id", id);

        if (capabilitiesError) {
          console.error("Error fetching capabilities:", capabilitiesError);
          return;
        }

        setCollectiveCapabilities(capabilitiesData);


        const { data: tokensData, error: tokensError } = await supabase
          .from("tokens")
          .select("*")
          .eq("collective_id", id);

        if (tokensError) {
          console.error("Error fetching tokens:", tokensError);
          return;
        }

        if (tokensData && tokensData.length > 0) {
          setToken(tokensData[0]);
          await fetchHolders(tokensData[0].contract_principal, tokensData[0].symbol);
          setTokenSymbol(tokensData[0].symbol);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchHolders = async (contractPrincipal: string, tokenSymbol: string) => {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tokens/ft/${contractPrincipal}::${tokenSymbol}/holders`
      );
      const data = await response.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const holdersWithPercentage = data.results.map((holder: any) => ({
        ...holder,
        percentage: (Number(holder.balance) / Number(data.total_supply)) * 100,
      }));

      setHolders(holdersWithPercentage);
    } catch (error) {
      console.error("Error fetching holders:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!collective) {
    return (
      <div className="text-center">
        <p>Collective not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 space-y-6">
      <CollectiveOverview collective={collective} token={token} />
      
      {collectiveCapabilities && collectiveCapabilities.length > 0 && (
        <CollectiveCapabilities capabilities={collectiveCapabilities} />
      )}
      
      {collectiveCapabilities?.some(cap => cap.type === "token") && (
        <CollectiveHolders holders={holders} tokenSymbol={tokenSymbol} />
      )}

      <div className="text-sm text-muted-foreground mt-8">
        Created {format(new Date(collective.created_at), "PPpp")}
      </div>
    </div>
  );
}
