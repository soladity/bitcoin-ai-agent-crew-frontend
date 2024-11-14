"use client";

import * as React from "react";
import { useUserData } from "@/hooks/useUserData";

export function Nav() {
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
    <SidebarFooter className="max-lg:hidden">
      <Dropdown>
        <DropdownButton as={SidebarItem}>
          <span className="flex min-w-0 items-center gap-3">
            <Avatar src="/users/erica.jpg" className="size-10" square alt="" />
            <span className="min-w-0">
              <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                Erica
              </span>
              <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                erica@example.com
              </span>
            </span>
          </span>
          <ChevronUpIcon />
        </DropdownButton>
        <AccountDropdownMenu anchor="top start" />
      </Dropdown>
    </SidebarFooter>
  );
}
