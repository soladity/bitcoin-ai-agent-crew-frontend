"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { Coins, Loader2, PiggyBank, Settings2, Vault } from "lucide-react";
import { Heading } from "../catalyst/heading";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Collective } from "@/types/supabase";

export interface Capability {
  id: string;                
  collective_id: string;     
  type: string;
}

const Collectives = () => {
  const [collectives, setCollectives] = useState<Collective[]>([]);
  const [collectiveCapabilities, setCollectiveCapabilities] =
    useState<Capability[]>([]);

  const [loading, setLoading] = useState(true);

  const router = useRouter();


  useEffect(() => {
    const fetchCollectives = async () => {

      const { data, error } = await supabase
        .from("collectives")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching collectives:", error);
      } else {
        setCollectives(data || []);
      }
      setLoading(false);
    };

    const fetchCollectiveCapabilities = async () => {
      try {
        const { data, error } = await supabase
          .from("capabilities")
          .select("id, collective_id, type")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching collective capabilities:", error);
        } else {
          setCollectiveCapabilities(data || []);
        }
      } catch (error) {
        console.error("Error fetching collective capabilities:", error);
      }
    };

    fetchCollectiveCapabilities();

    fetchCollectives();
  }, []);

  if (loading) {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full flex-wrap items-end justify-between gap-4 border-zinc-950/10 pb-6 dark:border-white/10">
        <Heading>Collectives</Heading>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[24px]">Logo</TableHead>
              <TableHead className="w-auto">Name</TableHead>
              <TableHead className="w-full">Mission</TableHead>
              <TableHead className="w-[100px] text-center">Capabilities</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collectives.map((collective) => (
              <TableRow key={collective.id}>
                <TableCell className="flex items-center gap-2">
                  {collective.image_url && (
                    <Image
                      src={collective.image_url}
                      alt={collective.name}
                      width={100}
                      height={50}
                      className="rounded-full"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/collectives/${collective.id}`}
                    className="font-medium hover:underline"
                  >
                    {collective.name}
                  </Link>
                </TableCell>
                <TableCell>{collective.mission}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    {collectiveCapabilities
                      .filter((cap) => cap.collective_id === collective.id)
                      .map((cap) => (
                        <span key={cap.id} title={cap.type}>
                          {cap.type === "token" && <Coins className="h-4 w-4" />}
                          {cap.type === "governance" && <Settings2 className="h-4 w-4" />}
                          {cap.type === "dex" && <PiggyBank className="h-4 w-4" />}
                          {cap.type === "pool" && <Vault className="h-4 w-4" />}
                        </span>
                      ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/collectives/${collective.id}`)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Collectives;
