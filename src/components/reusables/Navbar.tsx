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
import { ChevronDown, User } from "lucide-react";

export function Nav() {
  const [stxAddress, setStxAddress] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    async function fetchUserData() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user && user.email) {
          setStxAddress(user.email);

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          if (profileData && profileData.role === "Admin") {
            setIsAdmin(true);
          }
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
    const [localPart] = stxAddress.split("@");
    const shortened = `${localPart.slice(0, 10)}...${localPart.slice(-4)}`;
    return shortened.toUpperCase();
  }, [stxAddress]);

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center mb-8 relative">
      <div className="w-[100px] flex items-center">
        <Link href="/dashboard">
          <Image
            src="/logos/aibtcdev-avatar-250px.png"
            height={40}
            width={40}
            alt="aibtc.dev"
          />
        </Link>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Link href="/dashboard">
          <Image
            src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
            height={100}
            width={500}
            alt="aibtc.dev"
            className="w-auto max-w-[500px]"
          />
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {isLoading ? (
                "Loading..."
              ) : error ? (
                <span className="text-red-500">Error</span>
              ) : (
                <span className="font-mono">{displayAddress}</span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem className="font-mono">
              {stxAddress.split("@")[0].toUpperCase()}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOut />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button>
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
        {isAdmin && (
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
