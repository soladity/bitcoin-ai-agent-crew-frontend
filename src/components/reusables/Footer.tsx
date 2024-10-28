import * as React from "react";
import Link from "next/link";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  TwitterLogoIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import { Disclaimer } from "@/components/reusables/Disclaimer";

import { Button } from "@/components/ui/button";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col justify-center items-center max-w-screen-xl mx-auto px-4 space-y-6">
        <Disclaimer />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/aibtcdev"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GitHubLogoIcon className="h-6 w-6" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://discord.gg/Z59Z3FNbEX"
              rel="noopener noreferrer"
              target="_blank"
            >
              <DiscordLogoIcon className="h-6 w-6" />
              <span className="sr-only">Discord</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://x.com/aibtcdev"
              rel="noopener noreferrer"
              target="_blank"
            >
              <TwitterLogoIcon className="h-6 w-6" />
              <span className="sr-only">Twitter</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://aibtc.dev"
              rel="noopener noreferrer"
              target="_blank"
            >
              <GlobeIcon className="h-6 w-6" />
              <span className="sr-only">Website</span>
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
