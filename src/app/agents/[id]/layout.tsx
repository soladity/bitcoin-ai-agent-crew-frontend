"use client";

import React from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Info, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();

  const isOverview = pathname === `/agents/${id}`;
  const isTasks = pathname === `/agents/${id}/tasks`;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-start items-center">
        <div className="flex gap-2">
          <Link href={`/agents/${id}`}>
            <Button variant={isOverview ? "default" : "ghost"}>
              <Info className="mr-2 h-4 w-4" />
              Overview
            </Button>
          </Link>
          <Link href={`/agents/${id}/tasks`}>
            <Button variant={isTasks ? "default" : "ghost"}>
              <ListChecks className="mr-2 h-4 w-4" />
              Tasks
            </Button>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
