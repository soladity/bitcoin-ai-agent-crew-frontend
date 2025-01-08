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
import { Heading } from "@/components/ui/heading";
import { Token } from "@/types/supabase";

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

      // Combine the data
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
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>DAOs</Heading>
        <Input
          placeholder="Search daos..."
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
              {filteredDAOs.map((dao) => {
                const token = tokens.find((token) => token.dao_id === dao.id);
                const randomPrice = (Math.random() * 100).toFixed(2);
                return (
                  <ClickableTableRow key={dao.id} href={`/daos/${dao.id}`}>
                    <TableCell className="w-[80px]">
                      {token?.image_url && (
                        <Image
                          src={token.image_url || dao.image_url}
                          alt={dao.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                      )}
                    </TableCell>
                    <TableCell className="w-[300px] font-medium">
                      {dao.name}
                    </TableCell>
                    <TableCell className="w-[150px]">
                      {token?.symbol || "-"}
                    </TableCell>
                    <TableCell className="w-[150px] text-right">
                      ${randomPrice}
                    </TableCell>
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
