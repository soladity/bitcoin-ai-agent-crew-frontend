import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/reusables/Navbar";
import { Footer } from "@/components/reusables/Footer";

export const metadata: Metadata = {
  title: "Crews",
};

export default function CrewLayout({
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
