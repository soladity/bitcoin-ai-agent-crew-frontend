"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Info, Activity, Users, Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollectiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();

  const isOverview = pathname === `/collectives/${id}`;
  const isCapabilities = pathname === `/collectives/${id}/capabilities`;
  const isHolders = pathname === `/collectives/${id}/holders`;
  const isProposals = pathname === `/collectives/${id}/proposals`;

  return (
    <div className="container mx-auto space-y-4 px-4 py-6">
      <nav className="rounded-lg border border-border/10 bg-[#1A1A1A] p-4">
        <div className="flex flex-wrap gap-2">
          <Link href={`/collectives/${id}`}>
            <Button 
              variant={isOverview ? "default" : "ghost"}
              className="h-8 text-sm hover:bg-white/5"
            >
              <Info className="mr-2 h-3.5 w-3.5" />
              Overview
            </Button>
          </Link>
          <Link href={`/collectives/${id}/capabilities`}>
            <Button 
              variant={isCapabilities ? "default" : "ghost"}
              className="h-8 text-sm hover:bg-white/5"
            >
              <Blocks className="mr-2 h-3.5 w-3.5" />
              Capabilities
            </Button>
          </Link>
          <Link href={`/collectives/${id}/holders`}>
            <Button 
              variant={isHolders ? "default" : "ghost"}
              className="h-8 text-sm hover:bg-white/5"
            >
              <Users className="mr-2 h-3.5 w-3.5" />
              Holders
            </Button>
          </Link>
          <Link href={`/collectives/${id}/proposals`}>
            <Button 
              variant={isProposals ? "default" : "ghost"}
              className="h-8 text-sm hover:bg-white/5"
            >
              <Activity className="mr-2 h-3.5 w-3.5" />
              Proposals
            </Button>
          </Link>
        </div>
      </nav>
      <main className="min-h-[calc(100vh-12rem)]">
        {children}
      </main>
    </div>
  );
}
