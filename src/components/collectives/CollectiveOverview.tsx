"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { BsGlobe, BsTwitterX, BsTelegram } from "react-icons/bs";
import {Collective, Token} from "@/types/supabase";

interface CollectiveOverviewProps {
  collective: Collective
  token: Token
}

function CollectiveOverview({ collective, token }: CollectiveOverviewProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="absolute inset-0 flex items-center justify-between p-8">
          <div className="flex items-center gap-6">
            {token.image_url && (
              <Image
                src={token.image_url}
                alt={collective.name}
                width={100}
                height={100}
                className="rounded-lg border-4 border-background"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold">{collective.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{collective.mission}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {collective.is_graduated && (
              <Badge variant="default" className="h-6">
                Graduated
              </Badge>
            )}
            {collective.is_deployed && (
              <Badge variant="default" className="h-6">
                Deployed
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4">
        {true && (
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Token Price</div>
            <div className="mt-2 text-2xl font-bold">2.34</div>
          </Card>
        )}
        {true && (
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Treasury Balance</div>
            <div className="mt-2 text-2xl font-bold">123.45</div>
          </Card>
        )}
        {true && (
          <Card className="p-6">
            <div className="text-sm text-muted-foreground">Members</div>
            <div className="mt-2 text-2xl font-bold">123</div>
          </Card>
        )}
      </div>

      {/* Description and Social Links */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Description</h2>
              {collective.description && collective.description.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show Less <ChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className={`mt-4 text-muted-foreground ${
              !isDescriptionExpanded && collective.description && collective.description.length > 200
                ? "line-clamp-4"
                : ""
            }`}>
              {collective.description}
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Mission Card */}
          <Card className="p-6 bg-primary/5 border-primary/10">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-md bg-primary/10">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">Mission</h3>
                <p className="mt-2 text-sm text-muted-foreground">{collective.mission}</p>
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              {collective.website_url && (
                <a
                  href={collective.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <BsGlobe className="h-5 w-5" />
                </a>
              )}
              {collective.x_url && (
                <a
                  href={collective.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <BsTwitterX className="h-5 w-5" />
                </a>
              )}
              {collective.telegram_url && (
                <a
                  href={collective.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md hover:bg-muted transition-colors"
                >
                  <BsTelegram className="h-5 w-5" />
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { CollectiveOverview };
export default CollectiveOverview;
