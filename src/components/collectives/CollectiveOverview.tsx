import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings2, ChevronDown, ChevronUp } from "lucide-react";
import { BsGlobe, BsTwitterX, BsTelegram } from "react-icons/bs";

interface CollectiveOverviewProps {
  collective: {
    name: string;
    mission: string;
    description?: string;
    image_url?: string;
    website_url?: string;
    x_url?: string;
    telegram_url?: string;
    is_graduated: boolean;
    is_deployed: boolean;
  };
}

export function CollectiveOverview({ collective }: CollectiveOverviewProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Image and Social Links */}
      <div className="col-span-2">
        <div className="sticky top-4 space-y-4">
          {collective.image_url && (
            <Image
              src={collective.image_url}
              alt={collective.name}
              width={200}
              height={200}
              className="rounded-lg w-full h-auto"
            />
          )}
          
          {/* Social Links */}
          <div className="flex items-center gap-3">
            {collective.website_url && (
              <a
                href={collective.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <BsGlobe className="h-5 w-5" />
              </a>
            )}
            {collective.x_url && (
              <a
                href={collective.x_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#1DA1F2] transition-colors"
              >
                <BsTwitterX className="h-5 w-5" />
              </a>
            )}
            {collective.telegram_url && (
              <a
                href={collective.telegram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#0088cc] transition-colors"
              >
                <BsTelegram className="h-5 w-5" />
              </a>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-col gap-2">
            {collective.is_graduated && (
              <span className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Graduated
              </span>
            )}
            {collective.is_deployed && (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                Deployed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Content */}
      <div className="col-span-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{collective.name}</h1>
            
            {/* Mission Statement Card */}
            <Card className="p-4 mb-4 bg-primary/5 border-primary/10">
              <div className="flex items-start gap-2">
                <div className="p-2 rounded-md bg-primary/10 mt-1">
                  <Settings2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-primary mb-1">Mission</h2>
                  <p className="text-sm leading-relaxed">{collective.mission}</p>
                </div>
              </div>
            </Card>

            {/* Description Section */}
            {collective.description && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-muted-foreground">About</h2>
                  {collective.description.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="h-8 px-2"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          Show Less <ChevronUp className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          Show More <ChevronDown className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className={`text-sm text-muted-foreground leading-relaxed ${
                  !isDescriptionExpanded && collective.description.length > 200
                    ? "line-clamp-4"
                    : ""
                }`}>
                  {collective.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
