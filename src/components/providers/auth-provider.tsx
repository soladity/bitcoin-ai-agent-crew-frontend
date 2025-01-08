"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useSessionStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
