import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agents",
};

export default function AgentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
