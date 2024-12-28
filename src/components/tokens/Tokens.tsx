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
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface DAO {
  id: number;
  name: string;
  symbol: string;
  decimals: number;
  token_supply: string;
  token_contract_principal: string;
  image_url: string;
  uri: string;
  graduated: boolean;
  deployed: boolean;
}

const Tokens = () => {
  const [tokens, setTokens] = useState<DAO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {

      const { data, error } = await supabase
        .from("daos")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching tokens:", error);
      } else {
        setTokens(data || []);
      }
      setLoading(false);
    };

    fetchTokens();
  }, []);

  if (loading) {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  return (
    <Card className="p-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Supply</TableHead>
              <TableHead>Contract Principal</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className="flex items-center gap-2">
                  {token.image_url && (
                    <Image
                      src={token.image_url}
                      alt={token.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <Link
                    href={`/tokens/${token.id}`}
                    className="hover:underline text-blue-600"
                  >
                    {token.name}
                  </Link>
                </TableCell>
                <TableCell>{token.symbol}</TableCell>
                <TableCell>
                  {Number(token.token_supply).toLocaleString()} (D:{" "}
                  {token.decimals})
                </TableCell>
                <TableCell>
                  <code className="text-sm">{token.token_contract_principal}</code>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {token.graduated && (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Graduated
                      </span>
                    )}
                    {token.deployed && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        Deployed
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default Tokens;
