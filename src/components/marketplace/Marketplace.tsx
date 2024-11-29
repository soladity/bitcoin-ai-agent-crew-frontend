import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, CheckSquare } from "lucide-react";
import { CrewDialog } from "./CrewDialog";
import type { PublicCrew } from "@/types/supabase";

async function getPublicCrews(): Promise<PublicCrew[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crew/public`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch crews");
  }
  return res.json();
}

export async function Marketplace() {
  const crews = await getPublicCrews();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {crews.map((crew) => (
        <Card key={crew.id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">{crew.name}</CardTitle>
              <Badge variant="secondary" className="ml-2">
                <Users className="w-3 h-3 mr-1" />
                {crew.clones || 0}
              </Badge>
            </div>
            <CardDescription>{crew.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Created By</h4>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm">{crew.creator_email}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckSquare className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {crew.agents?.reduce(
                        (count, agent) => count + (agent.tasks?.length || 0),
                        0
                      ) || 0}{" "}
                      Tasks
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {crew.agents?.length || 0} Agents
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <CrewDialog crew={crew} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
