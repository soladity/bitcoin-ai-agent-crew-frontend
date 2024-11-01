"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings, Play } from "lucide-react";

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();

  const isManage = pathname.includes("/manage");
  const isExecute = pathname.includes("/execute");

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-start items-center">
        <div className="flex gap-2">
          <Link href={`/crew/${id}/manage`}>
            <Button variant={isManage ? "default" : "outline"}>
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </Link>
          <Link href={`/crew/${id}/execute`}>
            <Button variant={isExecute ? "default" : "outline"}>
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
