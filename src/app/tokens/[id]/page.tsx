"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, User, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DAO {
  id: string;
  created_at: string;
  name: string;
  symbol: string;
  decimals: number;
  token_supply: string;
  uri: string;
  token_contract_principal: string;
  image_url: string;
  graduated: boolean;
  description: string;
  deployed: boolean;
  token_tx_id: string;
  pool_contract_principal: string;
  pool_tx_id: string;
  dex_contract_principal: string;
  dex_tx_id: string;
}

interface HolderResponse {
  total_supply: string;
  limit: number;
  offset: number;
  total: number;
  results: {
    address: string;
    balance: string;
  }[];
}

interface Holder {
  address: string;
  balance: string;
  percentage: number;
}

export default function TokenPage() {
  const params = useParams();
  const id = params.id as string;
  const [dao, setDao] = useState<DAO | null>(null);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [totalSupply, setTotalSupply] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [holdersLoading, setHoldersLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const { data, error } = await supabase
        .from("daos")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching token:", error);
      } else {
        setDao(data);
        // After getting token data, fetch holders
        if (data.token_contract_principal) {
          fetchHolders(data.token_contract_principal, data.symbol);
        }
      }
      setLoading(false);
    };

    fetchToken();
  }, [id]);

  const fetchHolders = async (contractPrincipal: string, symbol: string) => {
    try {
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/tokens/ft/${contractPrincipal}::${symbol}/holders?limit=20&offset=0`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch holders');
      }

      const data: HolderResponse = await response.json();
      setTotalSupply(data.total_supply);
      
      // Calculate percentages and create holder objects
      const holdersWithPercentages = data.results.map(holder => ({
        address: holder.address,
        balance: holder.balance,
        percentage: (Number(holder.balance) / Number(data.total_supply)) * 100
      }));

      setHolders(holdersWithPercentages);
    } catch (error) {
      console.error("Error fetching holders:", error);
    } finally {
      setHoldersLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="mr-2 h-4 w-4 animate-spin" />;
  }

  if (!dao) {
    return <div>Token not found</div>;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header with Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 col-span-2">
          <div className="flex items-center gap-4 mb-4">
            {dao.image_url && (
              <Image
                src={dao.image_url}
                alt={dao.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{dao.name}</h1>
              <p className="text-muted-foreground">{dao.symbol}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {dao.graduated && (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  Graduated
                </span>
              )}
              {dao.deployed && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                  Deployed
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Holdings</p>
              <p className="text-2xl font-bold">0 {dao.symbol}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Market Value</p>
              <p className="text-2xl font-bold">$0.00</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Holders List */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Holders</h2>
                <p className="text-sm text-muted-foreground">
                  Total Supply: {totalSupply ? Number(totalSupply).toLocaleString() : Number(dao.token_supply).toLocaleString()}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                Total holders: {holders.length}
              </span>
            </div>
            {holdersLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holders.map((holder, index) => (
                    <TableRow key={holder.address}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm">{holder.address}</code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(holder.balance).toLocaleString()} {dao.symbol}
                      </TableCell>
                      <TableCell className="text-right">{holder.percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Right Column - Trading Interface and Contract Info */}
        <div className="space-y-6">
          {/* Trading Interface */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Trade {dao.symbol}</h2>
            <div className="space-y-4">
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="buy">Buy</TabsTrigger>
                  <TabsTrigger value="sell">Sell</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select percentage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="100">100%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">Execute Trade</Button>
              </div>
            </div>
          </Card>

          {/* Contract Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Contract Principal</label>
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href={`https://explorer.hiro.so/txid/${dao.token_tx_id}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-muted px-2 py-1 rounded flex-1 flex items-center gap-2 hover:bg-muted/80"
                  >
                    <code>{dao.token_contract_principal}</code>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(dao.token_contract_principal)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Pool Contract</label>
                <div className="flex items-center gap-2 mt-1">
                  <a 
                    href={`https://explorer.hiro.so/txid/${dao.pool_tx_id}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-muted px-2 py-1 rounded flex-1 flex items-center gap-2 hover:bg-muted/80"
                  >
                    <code>{dao.pool_contract_principal}</code>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(dao.pool_contract_principal)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Created {format(new Date(dao.created_at), "PPpp")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
