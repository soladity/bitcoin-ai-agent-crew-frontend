"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  //ThumbsUp,
  //ThumbsDown,
  Timer,
  CheckCircle2,
  FileEdit,
  XCircle,
} from "lucide-react";

interface Proposal {
  id: string;
  created_at: string;
  title: string;
  description: string;
  code: string | null;
  link: string | null;
  monetary_ask: null;
  status: "DRAFT" | "PENDING" | "DEPLOYED" | "FAILED";
  contract_principal: string;
  tx_id: string;
  dao_id: string;
}

interface DAOProposalsProps {
  proposals: Proposal[];
}

function getStatusColor(status: Proposal["status"]) {
  switch (status) {
    case "DRAFT":
      return "bg-gray-500/10 text-gray-500";
    case "PENDING":
      return "bg-blue-500/10 text-blue-500";
    case "DEPLOYED":
      return "bg-green-500/10 text-green-500";
    case "FAILED":
      return "bg-red-500/10 text-red-500";
  }
}

function getStatusIcon(status: Proposal["status"]) {
  switch (status) {
    case "DRAFT":
      return <FileEdit className="h-3 w-3 sm:h-4 sm:w-4" />;
    case "PENDING":
      return <Timer className="h-3 w-3 sm:h-4 sm:w-4" />;
    case "DEPLOYED":
      return <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />;
    case "FAILED":
      return <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
  }
}

function DAOProposals({ proposals }: DAOProposalsProps) {
  const [statusFilter, setStatusFilter] = useState<Proposal["status"] | "all">(
    "all"
  );

  const filteredProposals = proposals.filter(
    (proposal) => statusFilter === "all" || proposal.status === statusFilter
  );

  const getVotePercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst;
    if (total === 0) return 0;
    return (votesFor / total) * 100;
  };

  const getEstimatedProposalEndDate = (proposalCreatedAt: string): Date => {
    const createdAt = new Date(proposalCreatedAt);
    const duration = 1000 * 60 * 60 * 24; // 1 day
    return new Date(createdAt.getTime() + duration);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="p-3 sm:p-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Active Proposals
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold">
            {proposals.filter((p) => p.status === "DEPLOYED").length}
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Success Rate
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold">
            {
              proposals.length > 1
                ? Math.round(
                    (proposals.filter((p) => p.status === "DEPLOYED").length /
                      proposals.filter((p) => p.status !== "DEPLOYED").length) *
                      100
                  )
                : 100 // one bootstrap = 100% successful
            }
            %
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Total Proposals
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold">
            {proposals.length}
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="text-xs sm:text-sm text-muted-foreground">
            Total Votes
          </div>
          <div className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold">
            <p>-</p>
            {/*proposals.reduce((acc, p) => acc + p.votesFor + p.votesAgainst, 0)*/}
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex justify-end">
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as Proposal["status"] | "all")
          }
        >
          <SelectTrigger className="w-[140px] sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Proposals</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="DEPLOYED">Deployed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Proposals List */}
      <div className="grid gap-3 sm:gap-4">
        {filteredProposals.map((proposal) => (
          <Card key={proposal.id} className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold break-all">
                      {proposal.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(
                        proposal.status
                      )} text-xs sm:text-sm whitespace-nowrap`}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(proposal.status)}
                        {proposal.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {proposal.description}
                  </p>
                </div>
              </div>

              {/* Voting Progress */}
              {/*
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    {proposal.votesFor} votes for
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    {proposal.votesAgainst} votes against
                  </span>
                </div>
                
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${getVotePercentage(
                        proposal.votesFor,
                        proposal.votesAgainst
                      )}%`,
                    }}
                  />
                </div>
                {proposal.quorum && (
                  <div className="text-xs text-muted-foreground">
                    Quorum: {proposal.quorum}%
                  </div>
                )}
              </div>
              */}

              {/* Timeline */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs sm:text-sm text-muted-foreground">
                <div>
                  Start:{" "}
                  {format(new Date(proposal.created_at), "MMM d, yyyy HH:mm")}
                </div>
                <div>
                  End:{" "}
                  {format(
                    getEstimatedProposalEndDate(proposal.created_at),
                    "MMM d, yyyy HH:mm"
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { DAOProposals };
export default DAOProposals;
