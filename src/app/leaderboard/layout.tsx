import React from "react";
import { Metadata } from "next";
import { ApplicationLayout } from "../application-layout";

export const metadata: Metadata = {
  title: "LeaderBoard",
};

export default function LeaderBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationLayout>{children}</ApplicationLayout>;
}
