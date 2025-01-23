"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { Extension } from "@/types/supabase";

interface DAOExtensionsProps {
  extensions: Extension[];
}

const getStatusColor = (status: Extension["status"]) => {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "inactive":
      return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  }
};

const getExplorerUrl = (txId: string) => {
  const baseUrl = "https://explorer.hiro.so/txid";
  const isTestnet = process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet";
  return `${baseUrl}/${txId}${isTestnet ? "?chain=testnet" : ""}`;
};

export function DAOExtensions({ extensions }: DAOExtensionsProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    Extension["status"] | "all"
  >("all");

  const filteredExtensions = extensions.filter((ext) =>
    selectedStatus === "all" ? true : ext.status === selectedStatus
  );

  const stats = {
    all: extensions.length,
    active: extensions.filter((e) => e.status === "DEPLOYED").length,
    pending: extensions.filter((e) => e.status === "pending").length,
    inactive: extensions.filter((e) => e.status === "inactive").length,
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">
          Extensions
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage and monitor your DAO&apos;s active extensions and capabilities
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6 pb-12">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <StatusButton
            status="all"
            count={stats.all}
            selected={selectedStatus === "all"}
            onClick={() => setSelectedStatus("all")}
          />
          <StatusButton
            status="active"
            count={stats.active}
            selected={selectedStatus === "active"}
            onClick={() => setSelectedStatus("active")}
          />
          <StatusButton
            status="pending"
            count={stats.pending}
            selected={selectedStatus === "pending"}
            onClick={() => setSelectedStatus("pending")}
          />
          <StatusButton
            status="inactive"
            count={stats.inactive}
            selected={selectedStatus === "inactive"}
            onClick={() => setSelectedStatus("inactive")}
          />
        </div>

        {/* Extensions List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredExtensions.map((extension) => (
            <div
              key={extension.id}
              className="group relative rounded-lg border bg-background/50 backdrop-blur-sm p-3 sm:p-4 transition-all hover:bg-background/80"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <h3 className="text-sm sm:text-base font-medium capitalize">
                      {extension.type.replace("-", " ")}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(
                        extension.status
                      )} border capitalize text-xs`}
                    >
                      {extension.status}
                    </Badge>
                  </div>
                  {extension.contract_principal && (
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-muted truncate max-w-[350px] sm:max-w-[250px] lg:max-w-full">
                        {extension.contract_principal}
                      </code>
                    </div>
                  )}
                  {extension.tx_id && (
                    <a
                      href={getExplorerUrl(extension.tx_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <span className="truncate max-w-[350px] sm:max-w-[250px] lg:max-w-full">
                        TX: {extension.tx_id}
                      </span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(extension.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Status Button Component
function StatusButton({
  status,
  count,
  selected,
  onClick,
}: {
  status: Extension["status"] | "all";
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="h-8"
    >
      <span className="capitalize">{status}</span>
      <span className="ml-2 text-xs bg-primary-foreground/10 px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </Button>
  );
}

export default DAOExtensions;
