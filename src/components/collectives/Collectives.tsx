"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ClickableTableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Heading } from "../catalyst/heading";
import { Token } from "@/types/supabase";

interface Collective {
  id: string;
  name: string;
  mission: string;
  description: string;
  image_url: string;
  is_graduated: boolean;
  is_deployed: boolean;
  created_at: string;
  capabilities?: Array<{
    id: string;
    type: string;
  }>;
}

export default function Collectives() {
  const [collectives, setCollectives] = useState<Collective[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCollectives();
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

  const fetchCollectives = async () => {
    try {
      setLoading(true);
      const { data: collectivesData, error: collectivesError } = await supabase
        .from("collectives")
        .select("*")
        .order("created_at", { ascending: false });

      if (collectivesError) throw collectivesError;
      if (!collectivesData) return;

      const { data: capabilitiesData, error: capabilitiesError } = await supabase
        .from("capabilities")
        .select("*");

      if (capabilitiesError) throw capabilitiesError;

      // Combine the data
      const enrichedCollectives = collectivesData.map(collective => ({
        ...collective,
        capabilities: capabilitiesData?.filter(cap => cap.collective_id === collective.id) || []
      }));

      setCollectives(enrichedCollectives);
    } catch (error) {
      console.error("Error fetching collectives:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollectives = collectives.filter(
    (collective) =>
      collective.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collective.mission.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Collectives</Heading>
        <Input
          placeholder="Search collectives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="mt-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead className="w-[300px]">Name</TableHead>
                <TableHead className="w-[150px]">Token Symbol</TableHead>
                <TableHead className="w-[150px] text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollectives.map((collective) => {
                const token = tokens.find((token) => token.collective_id === collective.id);
                const randomPrice = (Math.random() * 100).toFixed(2);
                return (
                  <ClickableTableRow 
                    key={collective.id}
                    href={`/collectives/${collective.id}`}
                  >
                    <TableCell className="w-[80px]">
                      {token?.image_url && (
                        <Image
                          src={token.image_url || collective.image_url}
                          alt={collective.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                      )}
                    </TableCell>
                    <TableCell className="w-[300px] font-medium">{collective.name}</TableCell>
                    <TableCell className="w-[150px]">{token?.symbol || '-'}</TableCell>
                    <TableCell className="w-[150px] text-right">${randomPrice}</TableCell>
                  </ClickableTableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
