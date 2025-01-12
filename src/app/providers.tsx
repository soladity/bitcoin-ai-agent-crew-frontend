"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import ApplicationLayout from "./application-layout";
import { usePathname } from "next/navigation";
import { NextStepProvider, NextStep, Tour } from "nextstepjs";
import CustomCard from "@/components/reusables/CustomCard";

const queryClient = new QueryClient();
const steps: Tour[] = [
  {
    tour: "mainTour",
    steps: [
      {
        icon: "👋",
        title: "Welcome to Aibtcdev",
        content: "I'm your guide to help you get started..",
        selector: "#step1",
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "👋",
        title: "This is second step",
        content: "I'm your guide to help you get started. second step.",
        selector: "#step2",
        side: "right",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "👋",
        title: "This is second step",
        content: "I'm your guide to help you get started. second step.",
        selector: "#step3",
        side: "right",
        showControls: true,
        showSkip: true,
      },
    ],
  },
];

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const content =
    pathname === "/" ? (
      children
    ) : (
      <ApplicationLayout>{children}</ApplicationLayout>
    );

  return (
    <ThemeProvider
      defaultTheme="dark"
      attribute="class"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <NextStepProvider>
          <NextStep steps={steps} cardComponent={CustomCard}>
            {content}
          </NextStep>
        </NextStepProvider>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
