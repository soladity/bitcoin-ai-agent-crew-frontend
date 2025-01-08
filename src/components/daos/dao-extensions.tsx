"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Coins,
  Wallet,
  MessageSquare,
  Share2,
  PlayCircle,
  PiggyBank,
  Vault,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Extension } from "@/types/supabase";

interface DAOExtensionsProps {
  extensions: Extension[];
}

const getExtensionIcon = (type: Extension["type"]) => {
  switch (type) {
    case "dex":
      return <PiggyBank className="h-5 w-5" />;
    case "token":
      return <Coins className="h-5 w-5" />;
    case "treasury":
      return <Vault className="h-5 w-5" />;
    case "bank-account":
      return <Building2 className="h-5 w-5" />;
    case "messaging":
      return <MessageSquare className="h-5 w-5" />;
    case "payments":
      return <Wallet className="h-5 w-5" />;
    case "actions":
      return <PlayCircle className="h-5 w-5" />;
    case "direct-execute":
      return <Code2 className="h-5 w-5" />;
    case "pool":
      return <Share2 className="h-5 w-5" />;
    default:
      return <Share2 className="h-5 w-5" />;
  }
};

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

function DAOExtensions({ extensions }: DAOExtensionsProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    Extension["status"] | "all"
  >("all");

  const filteredExtensions = extensions.filter((ext) =>
    selectedStatus === "all" ? true : ext.status === selectedStatus
  );

  const stats = {
    all: extensions.length,
    active: extensions.filter((e) => e.status === "active").length,
    pending: extensions.filter((e) => e.status === "pending").length,
    inactive: extensions.filter((e) => e.status === "inactive").length,
  };

  return (
    <div className="relative">
      {/* Header Section */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
        <div className="relative z-10 px-6 py-8">
          <div className="mx-auto max-w-screen-xl">
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Extensions
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your DAO&apos;s active extensions and
              capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-xl px-6 space-y-6">
        {/* Status Filters */}
        <div className="flex gap-2">
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
        <div className="space-y-4">
          {filteredExtensions.map((extension) => (
            <div
              key={extension.id}
              className="group relative rounded-lg border bg-background/50 backdrop-blur-sm p-4 transition-all hover:bg-background/80"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg border ${getStatusColor(
                    extension.status
                  )}`}
                >
                  {getExtensionIcon(extension.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-medium capitalize">
                      {extension.type.replace("-", " ")}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(
                        extension.status
                      )} border capitalize`}
                    >
                      {extension.status}
                    </Badge>
                  </div>
                  {extension.contract_principal && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {extension.contract_principal}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {extension.tx_id && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      TX: {extension.tx_id}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
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

export { DAOExtensions };
export default DAOExtensions;
