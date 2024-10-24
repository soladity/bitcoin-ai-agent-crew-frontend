"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import SignOut from "../auth/SignOut";

export function Nav() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
      <Link className="flex items-center justify-center" href="/dashboard">
        <Image
          src="/logos/aibtcdev-avatar-250px.png"
          height={40}
          width={40}
          alt="aibtc.dev"
          className="mr-2"
        />
      </Link>
      <Link className="flex items-center justify-center" href="/dashboard">
        <Image
          src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
          height={500}
          width={100}
          alt="aibtc.dev"
          className="mr-2"
        />
      </Link>
      <div className="flex items-center gap-4">
        <SignOut />
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
