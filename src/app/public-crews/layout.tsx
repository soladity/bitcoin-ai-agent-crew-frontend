import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/reusables/Navbar";
import { Footer } from "@/components/reusables/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Public Crews",
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
        <Toaster />
      </div>
    </>
  );
}
