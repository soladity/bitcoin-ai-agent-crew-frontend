import React from "react";
import { Metadata } from "next";
import { ApplicationLayout } from "../application-layout";

export const metadata: Metadata = {
  title: "Public Stats",
};

export default function PublicStatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationLayout>{children}</ApplicationLayout>;
}
