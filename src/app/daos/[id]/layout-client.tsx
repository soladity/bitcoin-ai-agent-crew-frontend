"use client";

import React, { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  Activity,
  Users,
  Blocks,
  Loader2,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface DAO {
  id: string;
  name: string;
  mission: string;
  description: string;
  image_url: string;
  is_graduated: boolean;
  is_deployed: boolean;
  created_at: string;
}

export function DAOLayoutClient({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();
  const [dao, setDao] = useState<DAO | null>(null);
  const [loading, setLoading] = useState(true);

  const isOverview = pathname === `/daos/${id}`;
  const isExtensions = pathname === `/daos/${id}/extensions`;
  const isHolders = pathname === `/daos/${id}/holders`;
  const isProposals = pathname === `/daos/${id}/proposals`;

  useEffect(() => {
    const fetchDAO = async () => {
      try {
        const { data, error } = await supabase
          .from("daos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setDao(data);
      } catch (error) {
        console.error("Error fetching DAO:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDAO();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4 px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/daos" className="hover:text-foreground transition-colors">
          DAOs
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium">
          {dao?.name || "Details"}
        </span>
      </div>

      {/* DAO Title */}
      <h1 className="text-3xl font-bold tracking-tight">{dao?.name}</h1>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border">
        <Link href={`/daos/${id}`} className="mr-6">
          <div
            className={`flex items-center gap-2 pb-2 ${
              isOverview
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">Overview</span>
          </div>
        </Link>
        <Link href={`/daos/${id}/extensions`} className="mr-6">
          <div
            className={`flex items-center gap-2 pb-2 ${
              isExtensions
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Blocks className="h-4 w-4" />
            <span className="text-sm font-medium">Extensions</span>
          </div>
        </Link>
        <Link href={`/daos/${id}/holders`} className="mr-6">
          <div
            className={`flex items-center gap-2 pb-2 ${
              isHolders
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Holders</span>
          </div>
        </Link>
        <Link href={`/daos/${id}/proposals`}>
          <div
            className={`flex items-center gap-2 pb-2 ${
              isProposals
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Proposals</span>
          </div>
        </Link>
      </div>

      {/* Content */}
      <main className="min-h-[calc(100vh-12rem)]">{children}</main>
    </div>
  );
}
