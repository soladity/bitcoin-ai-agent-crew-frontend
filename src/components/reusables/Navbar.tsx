"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import SignOut from "../auth/SignOut";
import { supabase } from "@/utils/supabase/client";
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

interface UserData {
  stxAddress: string;
  role: string;
  agentAddress: string | null;
  agentBalance: number | null;
}

export function Nav() {
  const [userData, setUserData] = React.useState<UserData>({
    stxAddress: "",
    role: "",
    agentAddress: null,
    agentBalance: null,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUserData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (user?.email) {
          const address = user.email.split("@")[0];
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role, assigned_agent_address")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          let agentBalance = null;
          if (profileData.assigned_agent_address) {
            try {
              const upperAgentAddress =
                profileData.assigned_agent_address.toUpperCase();
              const agentResponse = await fetch(
                `https://api.hiro.so/extended/v1/address/${upperAgentAddress}/balances`
              );
              if (agentResponse.ok) {
                const balanceData = await agentResponse.json();
                agentBalance = balanceData.stx?.balance
                  ? parseInt(balanceData.stx.balance) / 1000000
                  : 0;
              }
            } catch (err) {
              console.error("Error fetching agent balance:", err);
            }
          }

          setUserData({
            stxAddress: address.toUpperCase(),
            role: profileData.role,
            agentAddress:
              profileData.assigned_agent_address?.toUpperCase() || null,
            agentBalance,
          });
        } else {
          throw new Error("User or email not found");
        }
      } catch (e) {
        setError("Failed to fetch user data");
        console.error("Error fetching user data:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const displayAddress = React.useMemo(() => {
    const shortened = `${userData.stxAddress.slice(
      0,
      5
    )}...${userData.stxAddress.slice(-5)}`;
    return shortened;
  }, [userData.stxAddress]);

  const displayAgentAddress = React.useMemo(() => {
    if (!userData.agentAddress) return null;
    return `${userData.agentAddress}`;
  }, [userData.agentAddress]);

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
                    {userData.role}
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
                href={`https://explorer.hiro.so/address/${userData.stxAddress}`}
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center gap-2"
              >
                {userData.stxAddress}
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Agent Details</DropdownMenuLabel>
            {userData.agentAddress ? (
              <>
                <DropdownMenuItem className="font-mono">
                  <a
                    href={`https://explorer.hiro.so/address/${userData.agentAddress}`}
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
                      {userData.agentBalance !== null
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
        <Button variant="outline">
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
        {userData.role === "Admin" && (
          <Button variant="outline">
            <Link href="/admin">Admin Panel</Link>
          </Button>
        )}
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
