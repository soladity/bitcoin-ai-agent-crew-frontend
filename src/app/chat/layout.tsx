import React from "react";
import { Metadata } from "next";
import { ApplicationLayout } from "../application-layout";

export const metadata: Metadata = {
  title: "Chat",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApplicationLayout>{children}</ApplicationLayout>;
}
