"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import { Loader2, Search } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Token } from "@/types/supabase";
import { Card } from "@/components/ui/card";

interface DAO {
  id: string;
  name: string;
  mission: string;
  description: string;
  image_url: string;
  is_graduated: boolean;
  is_deployed: boolean;
  created_at: string;
  extensions?: Array<{
    id: string;
    type: string;
  }>;
}

export default function DAOs() {
  const [daos, setDAOs] = useState<DAO[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDAOs();
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const { data: tokensData, error: tokensError } = await supabase
        .from("tokens")
        .select("*");
      if (tokensError) throw tokensError;
      setTokens(tokensData);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDAOs = async () => {
    try {
      setLoading(true);
      const { data: daosData, error: daosError } = await supabase
        .from("daos")
        .select("*")
        .order("created_at", { ascending: false });

      if (daosError) throw daosError;
      if (!daosData) return;

      const { data: extensionsData, error: extensionsError } = await supabase
        .from("extensions")
        .select("*");

      if (extensionsError) throw extensionsError;

      const enrichedDAOs = daosData.map((dao) => ({
        ...dao,
        extensions:
          extensionsData?.filter((cap) => cap.dao_id === dao.id) || [],
      }));

      setDAOs(enrichedDAOs);
    } catch (error) {
      console.error("Error fetching daos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDAOs = daos.filter(
    (dao) =>
      dao.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dao.mission.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading className="text-2xl font-bold sm:text-3xl">DAOs</Heading>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search DAOs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredDAOs.map((dao) => {
          const token = tokens.find((token) => token.dao_id === dao.id);
          const placeholderPrice = " TBD";
          return (
            <Card
              key={dao.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => (window.location.href = `/daos/${dao.id}`)}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {token?.image_url && (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={token.image_url || dao.image_url}
                        alt={dao.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold group-hover:text-primary">
                      {dao.name}
                    </h3>
                    {token?.symbol && (
                      <p className="text-sm text-muted-foreground">
                        {token.symbol}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${placeholderPrice}</p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {dao.mission}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredDAOs.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-center text-muted-foreground">
            No DAOs found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
