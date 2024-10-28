import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/reusables/Navbar";
import { Footer } from "@/components/reusables/Footer";

export const metadata: Metadata = {
  title: "LeaderBoard",
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
        <div className="min-h-screen">{children}</div>
        <Footer />
      </div>
    </>
  );
}
