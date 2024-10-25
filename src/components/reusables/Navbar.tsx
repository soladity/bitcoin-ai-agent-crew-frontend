"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import SignOut from "../auth/SignOut";
import { supabase } from "@/utils/supabase/client";
import { Button } from "../ui/button";

export function Nav() {
  const [stxAddress, setStxAddress] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchStxAddress() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (user && user.email) {
          setStxAddress(user.email);
        } else {
          throw new Error("User or email not found");
        }
      } catch (e) {
        setError("Failed to fetch STX address");
        console.error("Error fetching STX address:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStxAddress();
  }, []);

  const displayAddress = React.useMemo(() => {
    const [localPart] = stxAddress.split("@");
    return `${localPart.slice(0, 10)}...${localPart.slice(-4)}`;
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
        <span className="text-sm font-medium text-muted-foreground">
          {isLoading ? (
            "Loading STX Address..."
          ) : error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            <span className="ml-2 font-mono" title={stxAddress.split("@")[0]}>
              {displayAddress}
            </span>
          )}
        </span>
        <SignOut />
        <Button>
          <Link href="/leaderboard">Leaderboard</Link>
        </Button>
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
