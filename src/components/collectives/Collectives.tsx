"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Bolt, Coins, Loader2, PiggyBank, Settings2, Vault } from "lucide-react";
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

  const getCapabilityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "token":
        return <Coins className="h-4 w-4" />;
      case "governance":
        return <Settings2 className="h-4 w-4" />;
      case "dex":
        return <PiggyBank className="h-4 w-4" />;
      case "treasury":
        return <Vault className="h-4 w-4" />;
      default:
        return <Bolt className="h-4 w-4" />;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading>All Collectives</Heading>
        <Input
          placeholder="Search collectives..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Logo</TableHead>
              <TableHead className="w-auto">Name</TableHead>
              <TableHead className="w-full">Mission</TableHead>
              <TableHead className="w-[150px] text-center">Capabilities</TableHead>
              <TableHead className="w-[100px] text-center">Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCollectives.map((collective) => (
              <TableRow key={collective.id}>
                <TableCell>
                  {tokens
                    .find((token) => token.collective_id === collective.id)
                    ?.image_url && (
                    <Image
                      src={
                        tokens.find((token) => token.collective_id === collective.id)?.image_url ||
                        collective.image_url
                      }
                      alt={collective.name}
                      width={40}
                      height={40}
                      className="rounded-lg"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">{collective.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {collective.mission}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    {collective.capabilities?.map((capability) => (
                      <div
                        key={capability.id}
                        className="p-1.5 rounded-md bg-muted"
                        title={capability.type}
                      >
                        {getCapabilityIcon(capability.type)}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    {collective.is_graduated && (
                      <Badge variant="default">Graduated</Badge>
                    )}
                    {collective.is_deployed && (
                      <Badge variant="default">Deployed</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/collectives/${collective.id}`}>
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
