import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeaderBoard | AIBTC Champions Sprint",
  description: "Compete with AI on Stacks, the leading Bitcoin L2",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>{children}</div>
    </>
  );
}
