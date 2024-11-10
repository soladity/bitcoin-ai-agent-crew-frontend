"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import SignOut from "../auth/SignOut";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/hooks/useUserData";

interface NavProps {
  openCrewSidebar?: () => void;
}

export function Nav({ openCrewSidebar }: NavProps) {
  const { data: userData, isLoading, error } = useUserData();

  const displayAddress = React.useMemo(() => {
    if (!userData?.stxAddress) return "";
    return `${userData.stxAddress.slice(0, 5)}...${userData.stxAddress.slice(
      -5
    )}`;
  }, [userData?.stxAddress]);

  const displayAgentAddress = userData?.agentAddress || null;

  const displayRole = React.useMemo(() => {
    if (
      !userData?.role ||
      userData.role === "" ||
      userData.role.toLowerCase() === "normal"
    ) {
      return "Normal User";
    }
    return userData.role;
  }, [userData?.role]);

  return (
    <header className="px-4 lg:px-6 h-auto flex flex-col md:flex-row items-center justify-between mt-4 mb-8 gap-4 md:gap-0">
      <div className="flex items-center gap-4 order-2 md:order-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Image
                src="/logos/aibtcdev-avatar-250px.png"
                height={40}
                width={40}
                alt="aibtc.dev"
                className="rounded-full"
              />
              {isLoading ? (
                "Loading..."
              ) : error ? (
                <span className="text-red-500">Error</span>
              ) : (
                <>
                  <span className="font-mono">{displayAddress}</span>
                  <Badge variant="secondary" className="ml-2">
                    {displayRole}
                  </Badge>
                </>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-90">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem className="font-mono">
              <a
                href={`https://explorer.hiro.so/address/${userData?.stxAddress}`}
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center gap-2"
              >
                {userData?.stxAddress}
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Agent Details</DropdownMenuLabel>
            {userData?.agentAddress ? (
              <>
                <DropdownMenuItem className="font-mono">
                  <a
                    href={`https://explorer.hiro.so/address/${userData?.agentAddress}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    {displayAgentAddress}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>
                      {userData?.agentBalance !== null
                        ? `${userData.agentBalance.toFixed(5)} STX`
                        : "Loading balance..."}
                    </span>
                  </div>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled>No agent assigned</DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOut />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="order-1 md:order-2">
        <Link href="/dashboard">
          <Image
            src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
            height={100}
            width={500}
            alt="aibtc.dev"
            className="w-auto max-w-[300px] md:max-w-[500px]"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4 order-3">
        <Button variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="outline" onClick={openCrewSidebar}>
          Manage Crews
        </Button>
        <Button variant="outline">
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
        {userData?.role === "Admin" && (
          <Button variant="outline">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
