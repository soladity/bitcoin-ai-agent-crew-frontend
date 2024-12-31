"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  ChevronUp,
  Code2,
  Coins,
  Wallet,
  MessageSquare,
  Share2,
  PlayCircle,
  PiggyBank,
  Vault,
  Building2,
} from "lucide-react";
import { Capability } from "@/types/supabase";

interface CollectiveCapabilitiesProps {
  capabilities: Capability[];
}

const getCapabilityIcon = (type: Capability["type"]) => {
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

const getStatusColor = (status: Capability["status"]) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
    case "inactive":
      return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  }
};

function CollectiveCapabilities({ capabilities }: CollectiveCapabilitiesProps) {
  const [expandedCapabilities, setExpandedCapabilities] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const toggleCapability = (id: string) => {
    setExpandedCapabilities((prev) =>
      prev.includes(id)
        ? prev.filter((capId) => capId !== id)
        : [...prev, id]
    );
  };

  const activeCapabilities = capabilities.filter((cap) => cap.status === "active");
  // const totalProgress = capabilities.reduce((acc, cap) => acc + (cap.progress || 0), 0) / capabilities.length;
  const totalProgress = capabilities.reduce((acc, ) => acc + (24), 0) / capabilities.length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Active Capabilities</div>
          <div className="mt-2 text-2xl font-bold">{activeCapabilities.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Total Capabilities</div>
          <div className="mt-2 text-2xl font-bold">{capabilities.length}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Overall Progress</div>
          <div className="mt-2">
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <span className="mt-2 inline-block text-sm">
              {totalProgress.toFixed(0)}%
            </span>
          </div>
        </Card>
      </div>

      {/* Capabilities List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {capabilities.map((capability) => (
            <Card key={capability.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(capability.status)}`}>
                    {getCapabilityIcon(capability.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{capability.type}</h3>
                      <Badge variant="outline" className="capitalize">
                        {capability.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {capability.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCapability(capability.id)}
                >
                  {expandedCapabilities.includes(capability.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {expandedCapabilities.includes(capability.id) && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {/* {capability.metrics.map((metric) => (
                    <div key={metric.name} className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {metric.name}
                      </div>
                      <div className="text-lg font-semibold">{metric.value}</div>
                      {metric.change && (
                        <div
                          className={`text-sm ${
                            metric.trend === "up"
                              ? "text-green-500"
                              : metric.trend === "down"
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {metric.change}
                        </div>
                      )}
                    </div>
                  ))} */}
                </div>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {capabilities
            .filter((cap) => cap.status === "active")
            .map((capability) => (
              <Card key={capability.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(capability.status)}`}>
                      {getCapabilityIcon(capability.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{capability.type}</h3>
                        <Badge variant="outline" className="capitalize">
                          {capability.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {capability.description}
                      </p>
                      {capability.updated_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Last updated: {capability.updated_at}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCapability(capability.id)}
                  >
                    {expandedCapabilities.includes(capability.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedCapabilities.includes(capability.id) && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {/* {capability.metrics.map((metric) => (
                      <div key={metric.name} className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          {metric.name}
                        </div>
                        <div className="text-lg font-semibold">{metric.value}</div>
                        {metric.change && (
                          <div
                            className={`text-sm ${
                              metric.trend === "up"
                                ? "text-green-500"
                                : metric.trend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {metric.change}
                          </div>
                        )}
                      </div>
                    ))} */}
                  </div>
                )}
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {capabilities
            .filter((cap) => cap.status === "pending")
            .map((capability) => (
              <Card key={capability.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(capability.status)}`}>
                      {getCapabilityIcon(capability.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{capability.type}</h3>
                        <Badge variant="outline" className="capitalize">
                          {capability.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {capability.description}
                      </p>
                      {capability.updated_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Last updated: {capability.updated_at}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCapability(capability.id)}
                  >
                    {expandedCapabilities.includes(capability.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedCapabilities.includes(capability.id) && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {/* {capability.metrics.map((metric) => (
                      <div key={metric.name} className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          {metric.name}
                        </div>
                        <div className="text-lg font-semibold">{metric.value}</div>
                        {metric.change && (
                          <div
                            className={`text-sm ${
                              metric.trend === "up"
                                ? "text-green-500"
                                : metric.trend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {metric.change}
                          </div>
                        )}
                      </div>
                    ))} */}
                  </div>
                )}
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {capabilities
            .filter((cap) => cap.status === "inactive")
            .map((capability) => (
              <Card key={capability.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getStatusColor(capability.status)}`}>
                      {getCapabilityIcon(capability.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{capability.type}</h3>
                        <Badge variant="outline" className="capitalize">
                          {capability.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {capability.description}
                      </p>
                      {capability.updated_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Last updated: {capability.updated_at}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCapability(capability.id)}
                  >
                    {expandedCapabilities.includes(capability.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedCapabilities.includes(capability.id) && (
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {/* {capability.metrics.map((metric) => (
                      <div key={metric.name} className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          {metric.name}
                        </div>
                        <div className="text-lg font-semibold">{metric.value}</div>
                        {metric.change && (
                          <div
                            className={`text-sm ${
                              metric.trend === "up"
                                ? "text-green-500"
                                : metric.trend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {metric.change}
                          </div>
                        )}
                      </div>
                    ))} */}
                  </div>
                )}
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { CollectiveCapabilities };
export default CollectiveCapabilities;
