"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Settings } from "lucide-react";

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;

  const isChat = pathname.includes("/chat");

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-start items-center">
        <div className="flex gap-2">
          <Link href={`/crew/${id}/chat`}>
            <Button variant={isChat ? "default" : "outline"}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </Link>
          <Link href={`/crew/${id}/manage`}>
            <Button variant={isChat ? "outline" : "default"}>
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
