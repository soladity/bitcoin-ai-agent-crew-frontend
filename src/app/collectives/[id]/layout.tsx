"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Info, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollectiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();

  const isOverview = !pathname.includes("/activity");

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-start items-center">
        <div className="flex gap-2">
        <Link href={`/collectives/${id}`}>
          <Button variant={isOverview ? "default" : "ghost"}>
            <Info className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </Link>
        <Link href={`/collectives/${id}/activity`}>
          <Button variant={!isOverview ? "default" : "ghost"}>
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </Button>
        </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
