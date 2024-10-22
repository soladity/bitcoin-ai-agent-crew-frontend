import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/reusables/Navbar";
import { Footer } from "@/components/reusables/Footer";

export const metadata: Metadata = {
  title: "Dashboard | AIBTC Champions Sprint",
  description: "Compete with AI on Stacks, the leading Bitcoin L2",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div>
        <Nav />
        {children}
        <Footer />
      </div>
    </>
  );
}
