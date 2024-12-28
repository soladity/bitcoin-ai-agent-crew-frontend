"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Info, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();

  const isOverview = !pathname.includes("/activity");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href={`/tokens/${id}`}>
          <Button variant={isOverview ? "default" : "ghost"}>
            <Info className="mr-2 h-4 w-4" />
            Overview
          </Button>
        </Link>
        <Link href={`/tokens/${id}/activity`}>
          <Button variant={!isOverview ? "default" : "ghost"}>
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </Button>
        </Link>
      </div>
      {children}
    </div>
  );
}
