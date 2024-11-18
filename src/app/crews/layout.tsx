import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crews",
};

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
