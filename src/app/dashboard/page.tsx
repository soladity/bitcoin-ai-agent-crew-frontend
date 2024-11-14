import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";

const page = () => {
  return (
    <SidebarProvider>
      <Dashboard />
    </SidebarProvider>
  );
};

export default page;
